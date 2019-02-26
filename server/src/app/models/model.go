package models

import (
	"database/sql"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

type Account struct {
	Id    int       `json:"id"`
	Name  string    `json:"name"`
	Email string    `json:"email"`
	Dob   time.Time `json:"dob"`
}

func DBConn() (db *sql.DB) {
	db, err := sql.Open("mysql", "root:12345@/dbexample")
	if err != nil {
		panic(err.Error())
	}
	return db
}

func GetAccByBirthday() (accounts []Account) {
	db := DBConn()
	rows, err := db.Query("SELECT id, name, email, DATE_FORMAT(dob, '%Y-%m-%d') FROM account WHERE DAY(dob) = DAY(CURDATE()) AND MONTH(dob) = MONTH(CURDATE())")
	if err != nil {
		panic(err.Error())
	}
	defer db.Close()
	for rows.Next() {
		var id int
		var name, email string
		var birthday string
		var conv time.Time

		err = rows.Scan(&id, &name, &email, &birthday)
		if err != nil {
			panic(err.Error())
		}
		conv, _ = time.Parse("2006-01-02", birthday)
		accounts = append(accounts, Account{Id: id, Name: name, Dob: conv, Email: email})
	}
	return accounts
}
