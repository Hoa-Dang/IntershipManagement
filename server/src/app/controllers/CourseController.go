package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"../common"
	"../models"
	"github.com/gin-gonic/gin"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Get course by id
func getCourseByID(c *gin.Context, id string) models.Course {
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	course := models.Course{}
	err := database.C(models.CollectionCourse).FindId(oID).One(&course)
	common.CheckError(c, err)

	return course
}

// Get course by id
func GetCourseByIDTrainee(c *gin.Context, id string) {
	// timeTrain := []
	var complete int64 = 0
	var all int64 = 0
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	course := models.Course{}
	err := database.C(models.CollectionCourse).Find(bson.M{"TraineeIDs": oID}).One(&course)
	common.CheckError(c, err)
	for i := 0; i < len(course.Detail); i++ {
		temp, _ := strconv.ParseInt(course.Detail[i].DurationPlan, 10, 64)
		all = all + temp
		if course.Detail[i].Progress == "100" {
			complete = complete + temp
		}
	}
	// timeTrain.
	c.JSON(http.StatusOK, course)
}

// List all courses
func ListCourses(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	courses := []models.Course{}
	err := database.C(models.CollectionCourse).Find(bson.M{"IsDeleted": false}).All(&courses)
	common.CheckError(c, err)

	c.JSON(http.StatusOK, courses)
}

// Get a course
func GetCourse(c *gin.Context) {
	course := getCourseByID(c, c.Param("id"))
	c.JSON(http.StatusOK, course)
}

// Get course by course name
func GetCourseByName(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)
	course := models.Course{}
	name := c.Param("name")
	err := database.C(models.CollectionCourse).Find(bson.M{"CourseName": name}).One(&course)
	common.CheckError(c, err)
	c.JSON(http.StatusOK, course)
}

// Create a course
func CreateCourse(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	course := models.Course{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &course)
	common.CheckError(c, err)

	err = database.C(models.CollectionCourse).Insert(course)
	common.CheckError(c, err)

	c.JSON(http.StatusCreated, nil)
}

// Update a course
func UpdateCourse(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	course := models.Course{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &course)
	common.CheckError(c, err)

	err = database.C(models.CollectionCourse).UpdateId(course.ID, course)
	common.CheckError(c, err)

	c.JSON(http.StatusOK, nil)
}

// Delete an attendance
func DeleteCourse(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)
	course := getCourseByID(c, c.Param("id"))
	course.IsDeleted = true
	err := database.C(models.CollectionCourse).UpdateId(course.ID, course)
	common.CheckError(c, err)

	c.JSON(http.StatusNoContent, nil)
}
