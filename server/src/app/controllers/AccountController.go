package controllers

import (
	"../models"
	"github.com/gin-gonic/gin"
)

func SelectByDob(c *gin.Context) {
	accounts := models.GetAccByBirthday()
	if len(accounts) == 0 {
		c.JSON(500, gin.H{
			"messages": "Data not found",
		})
		return
	}
	c.JSON(200, accounts)
}

func SelectWeather(c *gin.Context) {
	weathers, err := models.GetWeatherDataDarkSky()
	if err != nil {
		c.JSON(500, gin.H{
			"messages": "Data not found",
		})
		return
	}
	c.JSON(200, weathers)
}
