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

// Get supervisor by id
func getSupervisorByID(c *gin.Context, id string) models.Supervisor {
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	sup := models.Supervisor{}
	err := database.C(models.CollectionSupervisor).FindId(oID).One(&sup)
	common.CheckError(c, err)

	return sup
}

// List all supervisors
func ListSupervisors(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	sups := []models.Supervisor{}
	err := database.C(models.CollectionSupervisor).Find(bson.M{"IsDeleted": false}).All(&sups)
	common.CheckError(c, err)

	c.JSON(http.StatusOK, sups)
}

// Get an supervisor
func GetSupervisor(c *gin.Context) {
	sup := getSupervisorByID(c, c.Param("id"))
	c.JSON(http.StatusOK, sup)
}

// Create an supervisor
func CreateSupervisor(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	sup := models.Supervisor{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &sup)
	common.CheckError(c, err)

	err = database.C(models.CollectionSupervisor).Insert(sup)
	common.CheckError(c, err)

	c.JSON(http.StatusCreated, nil)
}

// Update an supervisor
func UpdateSupervisor(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	sup := models.Supervisor{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &sup)
	common.CheckError(c, err)

	err = database.C(models.CollectionSupervisor).UpdateId(sup.ID, sup)
	common.CheckError(c, err)

	c.JSON(http.StatusOK, nil)
}

// Delete an supervisor
func DeleteSupervisor(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)
	sup := getSupervisorByID(c, c.Param("id"))
	sup.IsDeleted = true
	err := database.C(models.CollectionSupervisor).UpdateId(sup.ID, sup)
	common.CheckError(c, err)

	c.JSON(http.StatusNoContent, nil)
}
