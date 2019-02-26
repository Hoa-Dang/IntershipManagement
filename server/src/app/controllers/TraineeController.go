package controllers

import (
	"encoding/json"
	"net/http"

	"io/ioutil"

	"../common"
	"../models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Get trainee by id
func getTraineeByID(c *gin.Context, id string) (error, *models.Trainee) {
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	trainee := models.Trainee{}
	err := database.C(models.CollectionTrainee).FindId(oID).One(&trainee)
	if err != nil {
		return err, nil
	}

	return nil, &trainee
}

// List all trainees
func ListTrainees(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)
	//trainees := []models.Trainee{}
	//err := database.C(models.CollectionTrainee).Find(bson.M{"IsDeleted": false}).All(&trainees)

	collection := database.C(models.CollectionTrainee)
	query := []bson.M{
		{
			"$lookup": bson.M{ // lookup the documents table here
				"from":         "course",
				"localField":   "CourseID",
				"foreignField": "_id",
				"as":           "Course",
			}},
		{
			"$unwind": "$Course",
		},
		{"$match": bson.M{
			"IsDeleted": false,
		}},
		{
			"$lookup": bson.M{ // lookup the documents table here
				"from":         "mentor",
				"localField":   "Course.MentorID",
				"foreignField": "_id",
				"as":           "Mentor",
			}},
		{
			"$unwind": "$Mentor",
		},
		{
			"$project": bson.M{
				"Name":        1,
				"PhoneNumber": 1,
				"Gender":      1,
				"Email":       1,
				"DayofBirth":  1,
				"University":  1,
				"Faculty":     1,
				"CourseID":    1,
				"IsDeleted":   1,
				"CourseName":  "$Course.CourseName",
				"MentorName":  "$Mentor.Name",
			},
		},
	}
	pipe := collection.Pipe(query)
	resp := []bson.M{}
	err := pipe.All(&resp)
	if common.CheckError(c, err) {
		return
	}

	c.JSON(http.StatusOK, resp)
}

// List all trainees by mentorID
func ListTraineesByMentorID(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	errGet, mentor := getMentorByID(c, c.Param("id"))
	if common.CheckError(c, errGet) {
		return
	}
	collection := database.C(models.CollectionTrainee)
	query := []bson.M{
		{
			"$lookup": bson.M{ // lookup the documents table here
				"from":         "course",
				"localField":   "CourseID",
				"foreignField": "_id",
				"as":           "Course",
			}},
		{
			"$unwind": "$Course",
		},
		{
			"$lookup": bson.M{ // lookup the documents table here
				"from":         "mentor",
				"localField":   "Course.MentorID",
				"foreignField": "_id",
				"as":           "Mentor",
			}},
		{"$match": bson.M{
			"IsDeleted":  false,
			"Mentor._id": mentor.ID,
		}},
		{
			"$project": bson.M{
				"Mentor": 0,
				"Course": 0,
			},
		},
	}
	pipe := collection.Pipe(query)
	resp := []bson.M{}
	err := pipe.All(&resp)
	if common.CheckError(c, err) {
		return
	}

	c.JSON(http.StatusOK, resp)
}

// Get an trainee
func GetTrainee(c *gin.Context) {
	err, trainee := getTraineeByID(c, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "Not found",
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
	if common.CheckError(c, err) {
		return
	}

	err = database.C(models.CollectionTrainee).Insert(trainee)
	if common.CheckError(c, err) {
		return
	}

	// get lastest trainee
	err = database.C(models.CollectionTrainee).Find(nil).Sort("-$natural").Limit(1).One(&trainee)
	common.CheckError(c, err)

	// Create User
	hash, _ := bcrypt.GenerateFromPassword([]byte(common.DefaultPassword), bcrypt.DefaultCost)
	user := models.User{}
	user.UserName = trainee.Email
	user.Password = string(hash)
	user.Role = 1
	user.RoleID = trainee.ID

	err = database.C(models.CollectionUser).Insert(user)
	if common.CheckError(c, err) {
		return
	}

	c.JSON(http.StatusCreated, nil)
}

// Update an trainee
func UpdateTrainee(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	trainee := models.Trainee{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &trainee)
	if common.CheckError(c, err) {
		return
	}

	err = database.C(models.CollectionTrainee).UpdateId(trainee.ID, trainee)
	if common.CheckError(c, err) {
		return
	}

	c.JSON(http.StatusOK, nil)
}

// Delete an trainee
func DeleteTrainee(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)
	err := database.C(models.CollectionTrainee).UpdateId(bson.ObjectIdHex(c.Param("id")), bson.M{"$set": bson.M{"IsDeleted": true}})
	if common.CheckError(c, err) {
		return
	}

	//Delete User
	if !DeleteUser(c, bson.ObjectIdHex(c.Param("id"))) {
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// Send daily report to mentor
func SendReport(c *gin.Context) {
	//Read data from request
	body, errReading := ioutil.ReadAll(c.Request.Body)
	if errReading != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status:  common.Error,
			common.Message: common.ErrReadingRequestData,
		})
		return
	}

	//Parse json data to struct
	report := &models.Report{}
	errParsing := json.Unmarshal(body, report)
	if errParsing != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status:  common.Error,
			common.Message: common.ErrReadingRequestData,
		})
		return
	}

	//Get mentor's emails
	err, trainee := getTraineeByID(c, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			common.Status:  common.NotFound,
			common.Message: common.TraineeNotFound,
		})
		return
	}

	course := getCourseByID(c, string(trainee.CourseID.Hex()))

	err, mentor := getMentorByID(c, string(course.MentorID.Hex()))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			common.Status:  common.NotFound,
			common.Message: common.MentorNotFound,
		})
		return
	}

	//Send email to mentor
	email := &models.Email{
		From:     common.User,
		To:       mentor.Email,
		Subject:  report.Subject,
		Body:     report.Body,
		Username: common.User,
		Password: common.Password}
	errSending := models.SendEMail(*email)
	if errSending != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status:  common.Failed,
			common.Message: common.ErrSendMail,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		common.Status:  common.Success,
		common.Message: common.SendMailSuccess,
	})
}

func GetTraineesByMentor(c *gin.Context, id string) (error, []models.Trainee) {
	database := c.MustGet("db").(*mgo.Database)
	trainees := []models.Trainee{}
	err := database.C(models.CollectionTrainee).Find(bson.M{"IsDeleted": false}).All(&trainees)
	if err != nil {
		return err, nil
	}

	listTrainee := []models.Trainee{}
	for _, v := range trainees {
		course := getCourseByID(c, v.CourseID.Hex())
		if course.MentorID == bson.ObjectIdHex(id) {
			listTrainee = append(listTrainee, v)
		}
	}

	return nil, listTrainee
}
