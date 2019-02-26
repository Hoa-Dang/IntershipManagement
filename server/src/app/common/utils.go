package common

import "github.com/gin-gonic/gin"

func CheckError(c *gin.Context, err error) {
	if err != nil {
		c.Error(err)
		return
	}
}
