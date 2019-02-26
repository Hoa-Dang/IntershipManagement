package controllers

import (
	"encoding/json"
	"net/http"

	"../common"
	"../models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Get user by id
func getUserByID(c *gin.Context, id string) (error, *models.User) {
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	user := models.User{}
	err := database.C(models.CollectionUser).FindId(oID).One(&user)
	if err != nil {
		return err, nil
	}

	return nil, &user
}

// Get User Login
func getUserLogin(c *gin.Context, username string, password string) *models.User {
	database := c.MustGet("db").(*mgo.Database)

	user := models.User{}
	err := database.C(models.CollectionUser).Find(bson.M{"UserName": username, "Password": password}).One(&user)
	if common.CheckNotFound(c, err) {
		return nil
	}

	return &user
}

// Check Login from client
func CheckLogin(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	userTemp := models.User{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &userTemp)
	if common.CheckError(c, err) {
		return
	}

	user := models.User{}
	err = database.C(models.CollectionUser).Find(bson.M{"UserName": userTemp.UserName, "IsDeleted": false}).One(&user)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"message": err.Error(),
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(userTemp.Password)); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "Username or Password is not correct!",
		})
	} else {
		c.JSON(http.StatusOK, user)
	}
}

// List all users
func ListUsers(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	users := []models.User{}
	err := database.C(models.CollectionUser).Find(bson.M{"IsDeleted": false}).All(&users)
	if common.CheckError(c, err) {
		return
	}
	c.JSON(http.StatusOK, users)
}

// Get an user
func GetUser(c *gin.Context) {
	err, user := getUserByID(c, c.Param("id"))
	if common.CheckNotFound(c, err) {
		return
	}
	c.JSON(http.StatusOK, user)
}

// Create an user
func CreateUser(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	user := models.User{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &user)
	if common.CheckError(c, err) {
		return
	}

	err = database.C(models.CollectionUser).Insert(user)
	if common.CheckError(c, err) {
		return
	}

	c.JSON(http.StatusCreated, nil)
}

// Update an user
func UpdateUser(c *gin.Context) {
	database := c.MustGet("db").(*mgo.Database)

	user := models.User{}
	buf, _ := c.GetRawData()
	err := json.Unmarshal(buf, &user)
	if common.CheckError(c, err) {
		return
	}

	err = database.C(models.CollectionUser).UpdateId(user.ID, user)
	if common.CheckError(c, err) {
		return
	}

	c.JSON(http.StatusOK, nil)
}

// Delete an user
func DeleteUser(c *gin.Context, id bson.ObjectId) bool {
	database := c.MustGet("db").(*mgo.Database)

	err := database.C(models.CollectionUser).Update(bson.M{"RoleId": id}, bson.M{"$set": bson.M{"IsDeleted": true}})
	if common.CheckError(c, err) {
		return false
	}
	return true
}
