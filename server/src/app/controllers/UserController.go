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

// Get user by id
func getUserByID(c *gin.Context, id string) models.User {
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	user := models.User{}
	err := database.C(models.CollectionUser).FindId(oID).One(&user)
	common.CheckError(c, err)

	return user
}

// Get User Login
func getUserLogin(c *gin.Context, username string, password string) models.User {
	database := c.MustGet("db").(*mgo.Database)

	user := models.User{}
	err := database.C(models.CollectionUser).Find(bson.M{"UserName": username, "Password": password, "IsDeleted": false}).One(&user)
	common.CheckError(c, err)

	return user
}

// Check Login from client
func CheckLogin(c *gin.Context) {
	user := getUserLogin(c, c.Param("username"), c.Param("password"))

	c.JSON(http.StatusOK, user)
}

// List all users
func ListUsers(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	users := []models.User{}
	err := database.C(models.CollectionUser).Find(bson.M{"IsDeleted": false}).All(&users)
	common.CheckError(c, err)

	c.JSON(http.StatusOK, users)
}

// Get an user
func GetUser(c *gin.Context) {
	user := getUserByID(c, c.Param("id"))
	c.JSON(http.StatusOK, user)
}

// Create an user
func CreateUser(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	user := models.User{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &user)
	common.CheckError(c, err)

	err = database.C(models.CollectionUser).Insert(user)
	common.CheckError(c, err)

	c.JSON(http.StatusCreated, nil)
}

// Update an user
func UpdateUser(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	user := models.User{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &user)
	common.CheckError(c, err)

	err = database.C(models.CollectionUser).UpdateId(user.ID, user)
	common.CheckError(c, err)

	c.JSON(http.StatusOK, nil)
}

// Delete an user
func DeleteUser(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)
	user := getUserByID(c, c.Param("id"))
	user.IsDeleted = true
	err := database.C(models.CollectionUser).UpdateId(user.ID, user)
	common.CheckError(c, err)

	c.JSON(http.StatusNoContent, nil)
}
