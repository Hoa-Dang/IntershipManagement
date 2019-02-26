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

// Get course by id
func getCourseByID(c *gin.Context, id string) models.Course {
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	course := models.Course{}
	err := database.C(models.CollectionCourse).FindId(oID).One(&course)
	common.CheckError(c, err)

	return course
}

// List all courses
func ListCourses(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	//courses := []models.Course{}
	collection := database.C(models.CollectionCourse)
	query := []bson.M{
		{
			"$lookup": bson.M{ // lookup the documents table here
				"from":         "mentor",
				"localField":   "MentorID",
				"foreignField": "_id",
				"as":           "Mentor",
			}},
		{
			"$unwind": "$Mentor",
		},
		{"$match": bson.M{
			"IsDeleted": false,
		}},
		{
			"$project": bson.M{
				"CourseName": 1,
				"StartDate":  1,
				"EndDate":    1,
				"Detail":     1,
				"MentorID":   1,
				"IsDeleted":  1,
				"MentorName": "$Mentor.Name",
			},
		},
	}
	pipe := collection.Pipe(query)
	resp := []bson.M{}
	err := pipe.All(&resp)
	//err := database.C(models.CollectionCourse).Find(bson.M{"IsDeleted": false}).All(&courses)
	common.CheckError(c, err)

	c.JSON(http.StatusOK, resp)
}

// Get List Courses by MentorID
func GetCoursesByMentorID(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)
	collection := database.C(models.CollectionCourse)

	err, mentor := getMentorByID(c, c.Param("id"))
	common.CheckError(c, err)

	query := []bson.M{
		{
			"$lookup": bson.M{ // lookup the documents table here
				"from":         "mentor",
				"localField":   "MentorID",
				"foreignField": "_id",
				"as":           "Mentor",
			}},
		{
			"$unwind": "$Mentor",
		},
		{"$match": bson.M{
			"IsDeleted": false,
			"MentorID":  mentor.ID,
		}},
		{
			"$project": bson.M{
				"CourseName": 1,
				"StartDate":  1,
				"EndDate":    1,
				"Detail":     1,
				"MentorID":   1,
				"IsDeleted":  1,
				"MentorName": "$Mentor.Name",
			},
		},
	}
	pipe := collection.Pipe(query)
	resp := []bson.M{}
	err = pipe.All(&resp)
	common.CheckError(c, err)
	c.JSON(http.StatusOK, resp)
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
	/*
		arrObjectIds := []bson.ObjectId{bson.ObjectIdHex("123123"), bson.ObjectIdHex("43221")}
		courseDetails := []models.CourseDetail{
			{
				TrainingOutline: "Update",
				Content:         "contentUpdate",
				DurationPlan:    "",
				DurationActual:  "",
				Objectives:      "",
				TrainingMethod:  "",
				StartDate:       time.Date(2018, time.August, 10, 0, 0, 0, 0, time.UTC),
				EndDate:         time.Date(2018, time.August, 10, 0, 0, 0, 0, time.UTC),
				Progress:        "",
				Note:            "",
			},
			{
				TrainingOutline: "Updated_1",
				Content:         "contentUpdate",
				DurationPlan:    "",
				DurationActual:  "",
				Objectives:      "",
				TrainingMethod:  "",
				StartDate:       time.Date(2018, time.August, 10, 0, 0, 0, 0, time.UTC),
				EndDate:         time.Date(2018, time.August, 10, 0, 0, 0, 0, time.UTC),
				Progress:        "",
				Note:            "",
			},
		}
	*/
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

func GetCourseByTrainee(c *gin.Context, id string) (error, *models.Course){
	database := c.MustGet("db").(*mgo.Database)
	trainee := models.Trainee{}
	oID := bson.ObjectIdHex(id)
	err := database.C(models.CollectionTrainee).FindId(oID).One(&trainee)
	if err != nil {
		return err, nil
	}
	
	course := models.Course{}
	errCourse := database.C(models.CollectionCourse).FindId(trainee.CourseID).One(&course)
	if errCourse != nil {
		return errCourse, nil
	}

	return nil, &course
}
