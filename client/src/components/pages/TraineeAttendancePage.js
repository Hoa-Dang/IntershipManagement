import React from 'react';
import './attendance.css';
import Table from './components/trainee/Table'
import BarChart from './components/BarChart'
import $ from 'jquery';

class TraineeAttendancePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            traineeId: JSON.parse(localStorage.getItem('user')).RoleID,
            tableData: [],
            chartData: [],
            months: [],
            currentMonth: "",
            rightArrowClass: "fa fa-chevron-right",
            leftArrowClass: "fa fa-chevron-left",
            showChart: false,
            attendanceData: [],
            startDate: "",
            endDate: "",
            showData: true
        };
        this.getAttendance();
    }

    getAttendance() {
        $.ajax({
            url: "http://localhost:8080/attendance/" + this.state.traineeId +"/trainee",
            type: "GET",
            success: function (response) {
                this.setData(response);
                
            }.bind(this),
            error: function (xhr, status) {
                this.setState({showData: false});
            }.bind(this)
        });
    }

    setData(response) {
        var strMonths = this.createMonthsData(response.StartDate, response.EndDate);
        this.setState({
            attendanceData: response.Data,
            startDate: response.StartDate,
            endDate: response.EndDate
        });
        this.setState({
            tableData: this.loadTableData(this.getMonth(response.StartDate) - 1, this.getYear(response.StartDate)),
            chartData: this.loadChartData(this.getMonth(response.StartDate) - 1, this.getYear(response.StartDate)),
            months: strMonths,
            currentMonth: strMonths[0]
        }); 
    }

    createMonthsData(startDate, endDate) {
        var startMonth, startYear, endMonth, endYear;
        startMonth = this.getMonth(startDate);
        startYear = this.getYear(startDate);
        endMonth = this.getMonth(endDate);
        endYear = this.getYear(endDate);

        var arr = [];
        if (startYear === endYear) {           
            for (var i = startMonth; i <= endMonth; i++) {
                var strMonth = this.getMonthString(i) + " " + startYear.toString();
                arr.push(strMonth);
            }
        } else {
            for (var i = startMonth; i <= 12; i++) {
                var strMonth = this.getMonthString(i) + " " + startYear.toString();
                arr.push(strMonth);
            }
            for (var i = 1; i <= endMonth; i++) {
                var strMonth = this.getMonthString(i) + " " + endYear.toString();
                arr.push(strMonth);
            }
        }

        return arr;
    }

    onSelectChange(event) {
        var curValue = event.target.value;
        if (curValue === "Calendar"){
            this.setState({showChart: false});
        } else {
            this.setState({showChart: true});
        }
    }

    onRightArrowHover() {
        this.setState ({rightArrowClass: "fa fa-chevron-right arrow-hover"});
    }

    onRightArrowDeHover() {
        this.setState ({rightArrowClass: "fa fa-chevron-right"});
    }

    onRightArrowClick() {
        var index = this.state.months.indexOf(this.state.currentMonth);
        if (index + 1 >= this.state.months.length){
            this.setState({
                currentMonth: this.state.months[0],
                tableData: this.loadMonthData(this.state.months[0], "table"),
                chartData: this.loadMonthData(this.state.months[0], "chart")
            });
        } else {
            this.setState({
                currentMonth: this.state.months[index + 1],
                tableData: this.loadMonthData(this.state.months[index + 1], "table"),
                chartData: this.loadMonthData(this.state.months[index + 1], "chart")
            });
        }
    }

    onLeftArrowHover(){
        this.setState ({leftArrowClass: "fa fa-chevron-left arrow-hover"});
    }

    onLeftArrowDeHover() {
        this.setState ({leftArrowClass: "fa fa-chevron-left"});
    }

    onLeftArrowClick() {
        var index = this.state.months.indexOf(this.state.currentMonth);
        if (index - 1 < 0){
            this.setState({
                currentMonth: this.state.months[this.state.months.length - 1],
                tableData: this.loadMonthData(this.state.months[this.state.months.length - 1], "table"),
                chartData: this.loadMonthData(this.state.months[this.state.months.length - 1], "chart")
            });
        } else {
            this.setState({
                currentMonth: this.state.months[index-1],
                tableData: this.loadMonthData(this.state.months[index - 1], "table"),
                chartData: this.loadMonthData(this.state.months[index - 1], "chart")
            });
        }   
    }

    getDaysInMonth(month, year) {
        var date = new Date(year, month, 1);
        var days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;       
    }

    loadMonthData(monthValue, type) {
        var curMonth = monthValue.substring(0, monthValue.lastIndexOf(" "));
        var curYear = monthValue.substring(monthValue.lastIndexOf(" "));
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var month = months.indexOf(curMonth);
        if (type === "table") {
            return this.loadTableData(month, parseInt(curYear));
        } else {
            return this.loadChartData(month, parseInt(curYear));
        }
    }


    loadTableData(month, year) {
        var days = this.getDaysInMonth(month, year);
        var tableData = [];
        var rowData = this.createEmptyRow();
        var weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        for(var i = 0; i < days.length; i++){
            var strDay = days[i].toDateString();
            var weekDay = strDay.substring(0,3);
            var day = strDay.substring(8,10);

            if(weekDay === "Mon" && i !== 0){
                tableData.push(rowData);
                rowData =  this.createEmptyRow();  
                            
            }

            var index = weekDays.indexOf(weekDay);
            rowData[index].date = day;
            if (weekDay !== "Sat" && weekDay !== "Sun") {
                rowData[index].attendance = this.getAttendanceData(parseInt(day), month, year);
            }

            if(i === days.length - 1){
                tableData.push(rowData); 
            }
        }

        return tableData;
    }

    loadChartData(month, year) {
        var arr = [];
        var pCount, aCount, arCount, naCount;
        pCount = aCount = arCount = naCount = 0;

        var days = this.getDaysInMonth(month, year);
        for (var i = 0; i < days.length; i++) {
            if (days[i].getDay() === 6 || days[i].getDay() === 0) {
                naCount++;
            } else {
                var result = this.getAttendanceData(days[i].getDate(), month, year);
                switch(result) {
                    case "P" :
                        pCount++;
                        break;
                    case "A" :
                        aCount++;
                        break;
                    case "AR" :
                        arCount++;
                        break;
                    case "N.A" :
                        naCount++;
                        break;
                    default :
                        naCount++;
                        break;
                }
            }
        }

        arr.push(pCount);
        arr.push(aCount);
        arr.push(arCount);
        arr.push(naCount);
        return arr;
    }



    createEmptyRow() {
        var rowData = [];
        for(var i = 0; i < 7; i++){
            rowData.push({
                date: "",
                attendance: "N.A",
                weekDay: this.getWeekDay(i)
            });
        }
        return rowData;
    }

    getWeekDay(num) {
        var weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return weekDays[num];
    }

    getAttendanceData(day, month, year) {
        var startDate, endDate, startYear, startMonth, startDay, endYear, endMonth, endDay;
        startDate = this.state.startDate;
        endDate = this.state.endDate
        startYear = this.getYear(startDate);
        startMonth = this.getMonth(startDate) - 1;
        startDay = this.getDay(startDate);
        endYear = this.getYear(endDate);
        endMonth = this.getMonth(endDate) - 1;
        endDay = this.getDay(endDate);

        var start = new Date(startYear, startMonth, startDay);
        var end = new Date(endYear, endMonth, endDay);
        var mid = new Date(year, month, day);
        var today = new Date();

        if (mid >= start && mid <= end) {
            if (mid >= start && mid <= today) {
                for (var i = 0; i < this.state.attendanceData.length; i++) {
                    var strDate = this.state.attendanceData[i].Date.substring(0, 10);
                    var date = new Date(this.getYear(strDate), this.getMonth(strDate)-1, this.getDay(strDate));
                    if (mid.getTime() === date.getTime()) {
                        return this.state.attendanceData[i].Status;
                    }
                }
                return "P"
            } else {
                return "N.A"
            }
        } else {
            return "N.A"
        }
    }

    getYear(strDate) {
        return parseInt(strDate.substring(0, 4));
    }

    getMonth(strDate) {
        return parseInt(strDate.substring(5, 7));
    }

    getDay(strDate) {
        return parseInt(strDate.substring(8, 10));
    }

    getMonthString(iMonth) {
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (!(iMonth >= 1 && iMonth <= 12)) {
            return "";
        }
        return months[iMonth - 1];
    }

    render() {
        return (
            <div>
                {!this.state.showData ?
                <div className="alert alert-danger">
                    Couldn't load data.
                </div> : null}
                {this.state.showData ?
                <div>
                    <div>
                        <select className="browser-default custom-select custom-dropdown" id="select" onChange={this.onSelectChange.bind(this)}>      
                            <option>Calendar</option>
                            <option>Chart</option>         
                        </select>
                    </div>
                    <div className="center custom-table-header">
                        <div className="left-arrow">
                            <i className={this.state.leftArrowClass} aria-hidden="true" id="arrow-left"
                            onMouseOver={this.onLeftArrowHover.bind(this)}
                            onMouseOut={this.onLeftArrowDeHover.bind(this)}
                            onClick={this.onLeftArrowClick.bind(this)}></i>
                        </div>
                        <span className="month-header" id="month-header" ref="monthHeader">{this.state.currentMonth}</span>
                        <div className="right-arrow">
                            <i className={this.state.rightArrowClass} aria-hidden="true" id="arrow-right" 
                            onMouseOver={this.onRightArrowHover.bind(this)}
                            onMouseOut={this.onRightArrowDeHover.bind(this)}
                            onClick={this.onRightArrowClick.bind(this)}></i>
                        </div>
                    </div>
                    {!this.state.showChart ? 
                    <div className="card mt-6">
                        <div className="card-body">
                            <Table tableData={this.state.tableData} text={this.state.currentMonth}/>
                        </div>
                    </div> : null}       
                    {this.state.showChart ? 
                    <div className="card mt-6">
                        <div className="card-body"> 
                            <BarChart arr={this.state.chartData}/> 
                        </div>
                    </div> : null}
                </div> : null}
            </div>
        );
    }
}

export default TraineeAttendancePage;