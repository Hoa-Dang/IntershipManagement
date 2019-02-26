package controllers

import (
	"encoding/json"
	"net/http"

	"../common"
	"../models"
	"github.com/gin-gonic/gin"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"io/ioutil"
)

// Get trainee by id
func getTraineeByID(c *gin.Context, id string) (error, *models.Trainee) {
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	trainee := models.Trainee{}
	err := database.C(models.CollectionTrainee).FindId(oID).One(&trainee)
	//common.CheckError(c, err)
	if err != nil {
		return err, nil
	}

	return nil, &trainee
}

// List all trainees
func ListTrainees(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	trainees := []models.Trainee{}
	err := database.C(models.CollectionTrainee).Find(bson.M{"IsDeleted": false}).All(&trainees)
	common.CheckError(c, err)

	c.JSON(http.StatusOK, trainees)
}

// Get an trainee
func GetTrainee(c *gin.Context) {
	err, trainee := getTraineeByID(c, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status" : "Not found",
			"message": "Trainee not found",
		})
		return
	}
	c.JSON(http.StatusOK, trainee)
}

// Create an trainee
func CreateTrainee(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	trainee := models.Trainee{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &trainee)
	common.CheckError(c, err)

	err = database.C(models.CollectionTrainee).Insert(trainee)
	common.CheckError(c, err)

	c.JSON(http.StatusCreated, nil)
}

// Update an trainee
func UpdateTrainee(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	trainee := models.Trainee{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &trainee)
	common.CheckError(c, err)

	err = database.C(models.CollectionTrainee).UpdateId(trainee.ID, trainee)
	common.CheckError(c, err)

	c.JSON(http.StatusOK, nil)
}

// Delete an trainee
func DeleteTrainee(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)
	errGet, trainee := getTraineeByID(c, c.Param("id"))
	if errGet != nil {
		c.JSON(http.StatusBadRequest, nil)
		return
	}
	trainee.IsDeleted = true
	err := database.C(models.CollectionTrainee).UpdateId(trainee.ID, trainee)
	common.CheckError(c, err)

	c.JSON(http.StatusNoContent, nil)
}

// Send daily report to mentor
func SendReport(c *gin.Context) {
	//Set Access-Control-Allow-Origin
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Credentials", "true")
	c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")
	c.Header("Content-Type", "application/json")

	//Read data from request
	body, errReading := ioutil.ReadAll(c.Request.Body)
	if errReading != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status: common.Error,
			common.Message: common.ErrReadingRequestData,
		})
		return
	}

	//Parse json data to struct
	report := &models.Report{}
	errParsing := json.Unmarshal(body, report)
	if errParsing != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status: common.Error,
			common.Message: common.ErrReadingRequestData,
		})
		return
	}

	//Get mentor's emails
	err, trainee := getTraineeByID(c, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			common.Status: common.NotFound,
			common.Message: common.TraineeNotFound,
		})
		return
	}
	err, mentor := getMentorByID(c, string(trainee.MentorId.Hex()))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			common.Status: common.NotFound,
			common.Message: common.MentorNotFound,
		})
		return
	}

	//Send email to mentor
	email := &models.Email{
					From : common.User,
					To : mentor.Email,
					Subject : report.Subject,
					Body : report.Body,
					Username : common.User,
					Password : common.Password}
	errSending := models.SendEMail(*email)
	if errSending != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status: common.Failed,
			common.Message: common.ErrSendMail,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		common.Status: common.Success,
		common.Message: common.SendMailSuccess,
	})
}
