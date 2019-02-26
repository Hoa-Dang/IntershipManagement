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
	"time"
	"fmt"
)

// Get attendance by id
func getAttendanceByID(c *gin.Context, id string) (error, *models.Attendance) {
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	atten := models.Attendance{}
	err := database.C(models.CollectionAttendance).FindId(oID).One(&atten)
	//common.CheckError(c, err)
	if err != nil {
		return err, nil
	}

	return nil, &atten
}

// Get attendances by trainee's id
func getAttendanceByTrainee(c *gin.Context, id string) (error, []models.Attendance) {
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	attens := []models.Attendance{}
	err := database.C(models.CollectionAttendance).Find(bson.M{"TraineeId": oID}).All(&attens)
	if err != nil {
		return err, nil
	}

	return nil, attens
}

// Get daily attendance of a trainee
func getDailyAttendanceByTrainee(c *gin.Context, id string, date time.Time) (error, *models.Attendance) {
	database := c.MustGet("db").(*mgo.Database)
	oID := bson.ObjectIdHex(id)
	atten := models.Attendance{}
	err := database.C(models.CollectionAttendance).Find(bson.M{"TraineeId": oID, "Date": date}).One(&atten)
	if err != nil {
		return err, nil
	}

	return nil, &atten
}

// Get daily attendances of all trainees of a mentor
func GetDailyAttendance(c *gin.Context) {
	mentorId := c.Param("id")
	err, trainees := GetTraineesByMentor(c, mentorId)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			common.Status: "Not found",
			common.Message: "Trainees not found",
		})
		return
	}

	type ResponseObject struct {
		Id string
		Name string
		Attendance string
	}

	// Get current date
	currentTime := time.Now()
	currentDate := time.Date(currentTime.Year(), currentTime.Month(), currentTime.Day(), 0, 0, 0, 0, time.UTC)

	res := []ResponseObject{}
	for _, v := range trainees {
		attendance := "P"
		err, atten := getDailyAttendanceByTrainee(c, v.ID.Hex(), currentDate)
		if err == nil {
			attendance = atten.Status
		}
		data := ResponseObject{Id: v.ID.Hex(), Name: v.Name, Attendance: attendance}
		res = append(res, data)
	}
	c.JSON(http.StatusOK, res)
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
	err, atten := getAttendanceByID(c, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, nil)
	}
	c.JSON(http.StatusOK, atten)
}

// Get all attendances of a trainee
func GetTraineeAttendances(c *gin.Context) {
	err, attens := getAttendanceByTrainee(c, c.Param("id"))
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusNotFound, gin.H{
			common.Status: "Not found",
			common.Message: "Could not get attendance data",
		})
		return
	}

	errCourse, course := GetCourseByTrainee(c, c.Param("id"))
	if errCourse != nil {
		fmt.Println(errCourse)
		c.JSON(http.StatusNotFound, gin.H{
			common.Status: "Not found",
			common.Message: "Could not get student's course data",
		})
		return
	}


	c.JSON(http.StatusOK, gin.H{
		common.Status: "Success",
		"Data": attens,
		"CourseName": course.CourseName,
		"StartDate": course.StartDate,
		"EndDate": course.EndDate,
	})
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

// Insert a new attendance
func InsertAttendance(c *gin.Context, atten models.Attendance) error {
	database := c.MustGet("db").(*mgo.Database)
	err := database.C(models.CollectionAttendance).Insert(atten)
	if err != nil {
		return err
	}
	return nil
}

// Remove an attendance
func RemoveAttendance(c *gin.Context, atten models.Attendance) error {
	database := c.MustGet("db").(*mgo.Database)
	err := database.C(models.CollectionAttendance).Remove(atten)
	if err != nil {
		return err
	}
	return nil
}

// Update an attendance
func EditAttendance(c *gin.Context, atten models.Attendance, attendance string) error {
	database := c.MustGet("db").(*mgo.Database)
	newAtten := atten
	newAtten.Status = attendance
	err := database.C(models.CollectionAttendance).Update(atten, newAtten)
	if err != nil {
		return err
	}
	return nil
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
	errGet, atten := getAttendanceByID(c, c.Param("id"))
	if errGet != nil {
		c.JSON(http.StatusNotFound, nil)
	}
	atten.IsDeleted = true
	err := database.C(models.CollectionAttendance).UpdateId(atten.ID, atten)
	common.CheckError(c, err)

	c.JSON(http.StatusNoContent, nil)
}

// Update an attendance on a date
func UpdateAttendanceByDate(c *gin.Context) {
	// Read data from request
	body, errReading := ioutil.ReadAll(c.Request.Body)
	if errReading != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status: common.Error,
			common.Message: common.ErrReadingRequestData,
		})
		return
	}
	
	// Parse json data to struct
	data := models.UpdateAttendance{}
	errParsing := json.Unmarshal(body, &data)
	if errParsing != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status: common.Error,
			common.Message: common.ErrReadingRequestData,
		})
		return
	}

	fmt.Println(data)
	t, errParsingTime := time.Parse(time.RFC3339, data.Date)
	if errParsingTime != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status: common.Error,
			common.Message: "Couldn't parse time",
		})
	}
	fmt.Println("the time :")
	fmt.Println(t)


	date := time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
	errDb := false
	err, atten := getDailyAttendanceByTrainee(c, data.Id, date)
	if err != nil {
		// Insert to database new absent date
		if data.Attendance != "P" {
			atten := models.Attendance {
				Date : time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC),
				TraineeId : bson.ObjectIdHex(data.Id),
				Status : data.Attendance,
			}
			err := InsertAttendance(c, atten)
			if err != nil {
				fmt.Println(err)
				errDb = true
			}
		}
	} else {
		// Remove or update absent date
		if data.Attendance == "P" {
			err := RemoveAttendance(c, *atten)
			if err != nil {
				fmt.Println(err)
				errDb = true
			}
		} else {
			err := EditAttendance(c, *atten, data.Attendance)
			if err != nil {
				fmt.Println(err)
				errDb = true
			}
		}
	}

	if errDb {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status: "Failed",
			common.Message: "Update failed",
		})
		return
	}


	c.JSON(http.StatusOK, gin.H{
		common.Status: "OK",
		common.Message: "Update successfully",
	})
}

// Update daily attendance of all trainees of a mentor
func UpdateDailyAttendance(c *gin.Context) {
	// Read data from request
	body, errReading := ioutil.ReadAll(c.Request.Body)
	if errReading != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status: common.Error,
			common.Message: common.ErrReadingRequestData,
		})
		return
	}
	
	// Parse json data to struct
	data := []models.DailyAttendance{}
	errParsing := json.Unmarshal(body, &data)
	if errParsing != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status: common.Error,
			common.Message: common.ErrReadingRequestData,
		})
		return
	}

	// Get current date
	currentTime := time.Now()
	currentDate := time.Date(currentTime.Year(), currentTime.Month(), currentTime.Day(), 0, 0, 0, 0, time.UTC)

	errDb := false
	for _, v := range data {
		err, atten := getDailyAttendanceByTrainee(c, v.Id, currentDate)
		if err != nil {
			// Insert to database new absent date
			if v.Attendance != "P" {
				atten := models.Attendance {
					Date : time.Date(currentTime.Year(), currentTime.Month(), currentTime.Day(), 0, 0, 0, 0, time.UTC),
					TraineeId : bson.ObjectIdHex(v.Id),
					Status : v.Attendance,
				}
				err := InsertAttendance(c, atten)
				if err != nil {
					fmt.Println(err)
					errDb = true
				}
			}
		} else {
			// Remove or update absent date
			if v.Attendance == "P" {
				err := RemoveAttendance(c, *atten)
				if err != nil {
					fmt.Println(err)
					errDb = true
				}
			} else {
				err := EditAttendance(c, *atten, v.Attendance)
				if err != nil {
					fmt.Println(err)
					errDb = true
				}
			}
		}		
	}

	if errDb {
		c.JSON(http.StatusInternalServerError, gin.H{
			common.Status: "Failed",
			common.Message: "Update failed",
		})
		return
	}


	c.JSON(http.StatusOK, gin.H{
		common.Status: "OK",
		common.Message: "Update successfully",
	})
}
