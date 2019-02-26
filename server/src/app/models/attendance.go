package models

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

const (
	CollectionAttendance = "attendance"
)

type Attendance struct {
	ID         bson.ObjectId `bson:"_id,omitempty"`
	AbsentDate time.Time     `bson:"AbsentDate"`
	TraineeID  bson.ObjectId `bson:"TraineeID"`
	Status     bool          `bson:"Status"`    //true: permission, false: not permission
	IsDeleted  bool          `bson:"IsDeleted"` // true: deleted, false: not
}
