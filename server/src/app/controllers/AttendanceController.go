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

// Get attendance by id
func getAttendanceByID(c *gin.Context, id string) models.Attendance {
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	atten := models.Attendance{}
	err := database.C(models.CollectionAttendance).FindId(oID).One(&atten)
	common.CheckError(c, err)

	return atten
}

// List all attendances
func ListAttendances(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	attens := []models.Attendance{}
	err := database.C(models.CollectionAttendance).Find(bson.M{"IsDeleted": false}).All(&attens)
	common.CheckError(c, err)

	c.JSON(http.StatusOK, attens)
}

// Get an attendance
func GetAttendance(c *gin.Context) {
	atten := getAttendanceByID(c, c.Param("id"))
	c.JSON(http.StatusOK, atten)
}

// Create an attendance
func CreateAttendance(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	atten := models.Attendance{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &atten)
	common.CheckError(c, err)

	err = database.C(models.CollectionAttendance).Insert(atten)
	common.CheckError(c, err)

	c.JSON(http.StatusCreated, nil)
}

// Update an attendance
func UpdateAttendance(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	atten := models.Attendance{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &atten)
	common.CheckError(c, err)

	err = database.C(models.CollectionAttendance).UpdateId(atten.ID, atten)
	common.CheckError(c, err)

	c.JSON(http.StatusOK, nil)
}

// Delete an attendance
func DeleteAttendance(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)
	atten := getAttendanceByID(c, c.Param("id"))
	atten.IsDeleted = true
	err := database.C(models.CollectionAttendance).UpdateId(atten.ID, atten)
	common.CheckError(c, err)

	c.JSON(http.StatusNoContent, nil)
}
