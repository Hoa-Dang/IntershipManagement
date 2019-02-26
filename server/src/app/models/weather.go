package models

import (
	"math"

	"../common"
	"github.com/adlio/darksky"
)

type WeatherDataDarkSky struct {
	Date     string
	TempMin  float64
	TempMax  float64
	Humidity float64
	Icon     string
	Summary  string
}

type ListWeatherDataDarkSky struct {
	CityName string
	IconSign string
	Data     []WeatherDataDarkSky
}

func GetWeatherDataDarkSky() (*ListWeatherDataDarkSky, error) {
	client := darksky.NewClient(common.ApiKeyDarkSky)
	data, err := client.GetForecast(common.Latitude, common.Longitude, darksky.Arguments{"excludes": "daily", "units": "si", "extend": "hourly"})
	if err != nil {
		return nil, err
	}
	listWeatherData := ListWeatherDataDarkSky{}
	for _, v := range data.Daily.Data {
		tempData := &WeatherDataDarkSky{}
		tempData.Date = v.Time.Format("01-02-2006")
		tempData.TempMin = math.Round(v.TemperatureMin)
		tempData.TempMax = math.Round(v.TemperatureMax)

		tempData.Humidity = v.Humidity * 100
		tempData.Icon = common.ListIcons[v.Icon]
		tempData.Summary = v.Summary
		listWeatherData.Data = append(listWeatherData.Data, *tempData)
	}
	listWeatherData.CityName = common.CityName
	listWeatherData.IconSign = common.IconSign
	return &listWeatherData, nil
}
