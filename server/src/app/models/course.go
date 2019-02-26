package models

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

const (
	CollectionCourse = "course"
)

type Course struct {
	ID         bson.ObjectId   `bson:"_id,omitempty"`
	CourseName string          `bson:"CourseName"`
	StartDate  time.Time       `bson:"StartDate"`
	EndDate    time.Time       `bson:"EndDate"`
	TraineeIDs []bson.ObjectId `bson:"TraineeIDs"`
	Detail     []CourseDetail  `bson:"Detail"`
	IsDeleted  bool            `bson:"IsDeleted"` // true: deleted, false: not
}

type CourseDetail struct {
	TrainingOutline string    `bson:"TrainingOutline"`
	Content         string    `bson:"Content"`
	DurationPlan    string    `bson:"DurationPlan"`
	DurationActual  string    `bson:"DurationActual"`
	Objectives      string    `bson:"Objectives"`
	TrainingMethod  string    `bson:"TrainingMethod"`
	StartDate       time.Time `bson:"StartDate"`
	EndDate         time.Time `bson:"EndDate"`
	Progress        string    `bson:"Progress"`
	Note            string    `bson:"Note"`
}
