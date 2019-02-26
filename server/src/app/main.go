package main

import (
	"./controllers"
	"./db"
	"./middlewares"
	"github.com/gin-gonic/gin"
)

func init() {
	db.Connect()
}

func cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "application/json")
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-Max")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
		} else {
			c.Next()
		}
	}
}

func setupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(cors())

	// Middlewares
	r.Use(middlewares.Connect)
	r.Use(middlewares.ErrorHandler)
	r.Use(cors())

	// Birthdays and Weather
	r.GET("/getdob", controllers.SelectByDob)
	r.GET("/getweather", controllers.SelectWeather)

	// Users
	r.GET("/users", controllers.ListUsers)
	r.GET("/user/:id", controllers.GetUser)
	r.PUT("/login", controllers.CheckLogin)
	r.POST("/user", controllers.CreateUser)
	r.PUT("/user", controllers.UpdateUser)

	// Trainees
	r.GET("/trainees", controllers.ListTrainees)
	r.GET("/trainee/:id", controllers.GetTrainee)
	r.GET("/trainees/:id", controllers.ListTraineesByMentorID)
	r.POST("/trainee", controllers.CreateTrainee)
	r.POST("/trainee/:id/report", controllers.SendReport)
	r.PUT("/trainee", controllers.UpdateTrainee)
	r.DELETE("/trainee/:id", controllers.DeleteTrainee)

	// Mentors
	r.GET("/mentors", controllers.ListMentors)
	r.GET("/mentor/:id", controllers.GetMentor)
	r.POST("/mentor", controllers.CreateMentor)
	// r.PUT("/mentor", controllers.UpdateMentor)
	r.DELETE("/mentor/:id", controllers.DeleteMentor)

	// Supervisors
	r.GET("/supervisors", controllers.ListSupervisors)
	r.GET("/supervisor/:id", controllers.GetSupervisor)
	r.POST("/supervisor", controllers.CreateSupervisor)
	r.PUT("/supervisor", controllers.UpdateSupervisor)
	r.DELETE("/supervisor/:id", controllers.DeleteSupervisor)

	// Attendances
	r.GET("/attendances", controllers.ListAttendances)
	r.GET("/attendance/:id", controllers.GetAttendance)
	r.GET("/attendance/:id/trainee", controllers.GetTraineeAttendances)
	r.GET("/attendance/:id/mentor", controllers.GetDailyAttendance)
	r.POST("/attendance", controllers.CreateAttendance)
	r.POST("/attendance/daily", controllers.UpdateDailyAttendance)
	r.POST("/attendance/update", controllers.UpdateAttendanceByDate)
	r.PUT("/attendance", controllers.UpdateAttendance)
	r.DELETE("/attendance/:id", controllers.DeleteAttendance)

	// Courses
	// r.GET("/courses/progress", controllers.GetCourseByIDTrainee)
	r.GET("/courses", controllers.ListCourses)
	r.GET("/courses/:id", controllers.GetCoursesByMentorID)
	r.GET("/course/:id", controllers.GetCourse)
	r.GET("/coursename/:name", controllers.GetCourseByName)
	r.POST("/course", controllers.CreateCourse)
	r.PUT("/course", controllers.UpdateCourse)
	r.DELETE("/course/:id", controllers.DeleteCourse)
	r.GET("/courses/", controllers.ListCourses)

	return r
}

func main() {
	r := setupRouter()
	r.Run(":8080")
}
