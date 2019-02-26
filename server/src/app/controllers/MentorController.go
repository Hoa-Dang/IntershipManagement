package controllers

import (
	"encoding/json"
	"net/http"

	"../common"
	"../models"
	"github.com/gin-gonic/gin"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Get mentor by id
func getMentorByID(c *gin.Context, id string) (error, *models.Mentor) {
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	mentor := models.Mentor{}
	err := database.C(models.CollectionMentor).FindId(oID).One(&mentor)
	//common.CheckError(c, err)
	if err != nil {
		return err, nil
	}

	return nil, &mentor
}

// List all mentors
func ListMentors(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	mentors := []models.Mentor{}
	err := database.C(models.CollectionMentor).Find(bson.M{"IsDeleted": false}).All(&mentors)
	common.CheckError(c, err)

	c.JSON(http.StatusOK, mentors)
}

// Get an mentor
func GetMentor(c *gin.Context) {
	err, mentor := getMentorByID(c, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "Not found",
			"message": "Mentor not found",
		})
		return
	}
	c.JSON(http.StatusOK, mentor)
}

// Create an mentor
func CreateMentor(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	mentor := models.Mentor{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &mentor)
	common.CheckError(c, err)

	err = database.C(models.CollectionMentor).Insert(mentor)
	common.CheckError(c, err)

	c.JSON(http.StatusCreated, nil)
}

// Update an mentor
// func UpdateMentor(c *gin.Context) {
// 	database := c.MustGet("db").(*mgo.Database)

// 	type UpdateMentor struct {
// 		ID          string    `bson:"_id,omitempty"`
// 		Name        string    `bson:"Name"`
// 		PhoneNumber string    `bson:"PhoneNumber"`
// 		Email       string    `bson:"Email"`
// 		Gender      bool      `bson:"Gender"` //true: Male, false: Female
// 		DoB         time.Time `bson:"DayofBirth"`
// 		Department  string    `bson:"Department"`
// 	}

// 	mentorUpdate := models.Mentor{}
// 	mentor := UpdateMentor{}
// 	buf, _ := c.GetRawData()
// 	err := json.Unmarshal(buf, &mentor)
// 	common.CheckError(c, err)
// 	mentorUpdate = getMentorByID(c, mentor.ID)
// 	mentorUpdate.Name = mentor.Name
// 	mentorUpdate.PhoneNumber = mentor.PhoneNumber
// 	mentorUpdate.Email = mentor.Email
// 	mentorUpdate.Gender = mentor.Gender
// 	mentorUpdate.DoB = mentor.DoB
// 	mentorUpdate.Department = mentor.Department

// 	err = database.C(models.CollectionMentor).UpdateId(mentorUpdate.ID, mentorUpdate)
// 	common.CheckError(c, err)

// 	c.JSON(http.StatusOK, nil)
// }

// Delete an mentor
func DeleteMentor(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)
	errGet, mentor := getMentorByID(c, c.Param("id"))
	if errGet != nil {
		c.JSON(http.StatusBadRequest, nil)
		return
	}
	mentor.IsDeleted = true
	err := database.C(models.CollectionMentor).UpdateId(mentor.ID, mentor)
	common.CheckError(c, err)

	c.JSON(http.StatusNoContent, nil)
}
