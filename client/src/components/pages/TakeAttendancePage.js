import React from 'react';
import './attendance.css';
import $ from 'jquery';

class TakeAttendancePage extends React.Component {

    constructor(props) {
        super(props);
        var weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var date = new Date();
        var strDate = weekDays[date.getDay()] + ", " + months[date.getMonth()] + " " + this.getDate(date.getDate()) + ", " + date.getFullYear();
        this.state = {
            mentorId: JSON.parse(localStorage.getItem('user')).RoleID,
            curDate: strDate,
            tableData: [],
            iconClass: [],
            selectDefaultValue: [],
            disableButton: false,
            showSuccess: false,
            showError: false,
            showData: true
        };
        this.getStudents();
    }

    getStudents(){
        $.ajax({
            url: "http://localhost:8080/attendance/" + this.state.mentorId +"/mentor",
            type: "GET",
            success: function (response) {
                this.setState({tableData: response});
                var arrIcon = [], arrDefaultValue = [];
                for (var i = 0; i < this.state.tableData.length; i++) {
                    arrIcon.push(this.getIconClass(this.state.tableData[i].Attendance));
                    arrDefaultValue.push(this.state.tableData[i].Attendance);
                }
                this.setState({iconClass: arrIcon, selectDefaultValue: arrDefaultValue});
            }.bind(this),
            error: function (xhr, status) {
                this.setState({showData: false});
            }.bind(this)
        });
    }

    getDate(day) {
        switch(day) {
            case 1:
            case 21:
            case 31:
                return day.toString() + "st";
            case 2:
            case 22:
                return day.toString() + "nd";
            case 3:
            case 23:
                return day.toString() + "rd";
            default:
                return day.toString() + "th";
        }
    }

    getIconClass(attendance) {
        switch(attendance){
            case "P":
                return "fa fa-check custom-icon-green";
            case "A":
                return "fa fa-remove custom-icon-red";
            case "AR":
                return "fa fa-remove custom-icon-blue";
            case "O":
                return "fa fa-circle-o custom-icon-gray";
            default:
                return "";
        }
    }

    getAttendace(icon) {
        switch(icon){
            case "fa fa-check custom-icon-green":
                return "P";
            case "fa fa-remove custom-icon-red":
                return "A";
            case "fa fa-remove custom-icon-blue":
                return "AR";
            case "fa fa-circle-o custom-icon-gray":
                return "O";
            default:
                return "";
        }
    }

    onSelectChange(event) {
        var icon = this.getIconClass(event.target.value);
        var index = event.target.id;
        var arrIcon = this.state.iconClass, arrDefaultValue = this.state.selectDefaultValue;
        arrIcon[index] = icon;
        arrDefaultValue[index] = event.target.value;
        this.setState({iconClass: arrIcon, selectDefaultValue: arrDefaultValue});
    }

    handleSubmit(event) {
        this.resetAlerts();
        var data = this.state.tableData;
        var icon = this.state.iconClass;
        var attendanceData = [];
        for (var i = 0; i < data.length; i++) {
            attendanceData.push({
                            id: data[i].Id,
                            attendance: this.getAttendace(icon[i])
            });
        }
        this.setState({disableButton: true});
        $.ajax({
            url: "http://localhost:8080/attendance/daily",
            type: "POST",
            data: JSON.stringify(attendanceData),
            success: function (response) {
                this.setState({disableButton: false, showSuccess: true});
            }.bind(this),
            error: function (xhr, status) {
                this.setState({disableButton: false, showError: true});
                this.getStudents();
            }.bind(this)
        });
    }

    resetAlerts(){
        this.setState({showSuccess: false, showError: false});
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
                    {this.state.showSuccess ?
                    <div className="alert alert-success">
                        Update attendance successfully.
                    </div> : null}
                    {this.state.showError ?
                    <div className="alert alert-danger">
                        Update attendance failed.
                    </div> : null}
                    <div className="center custom-table-header">
                        <span className="month-header">{this.state.curDate}</span>
                    </div>
                    <div className="card mt-6">
                        <div className="card-body">
                            <table className="table custom-table1">
                                <thead>
                                    <tr>
                                        <th scope="col" className="weekday">Student</th>
                                        <th scope="col" className="weekday">Course</th>
                                        <th scope="col" className="weekday">Attendance</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody">                           
                                    {this.state.tableData.map(function(data, index){
                                        return (
                                            <tr key={index}>
                                                <td>{data.Name}</td>
                                                <td>Java</td>
                                                <td>
                                                    <i className={this.state.iconClass[index]}></i>
                                                    <span> </span>
                                                    <select className="browser-default custom-select td-dropdown2" value={this.state.selectDefaultValue[index]}
                                                    onChange={this.onSelectChange.bind(this)} id={index}>
                                                        <option value="P" className="custom-icon-green custom-bold">P</option>
                                                        <option value="A" className="custom-icon-red custom-bold">A</option>
                                                        <option value="AR" className="custom-icon-blue custom-bold">AR</option>
                                                        <option value="O" className="custom-icon-gray custom-bold">O</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    }.bind(this))}
                                </tbody>
                            </table>               
                        </div>
                        <div className="center">
                            <input type="submit" className="btn btn-primary custom-submit" value="Submit" disabled={this.state.disableButton} onClick={this.handleSubmit.bind(this)}/>
                        </div>   
                    </div>
                </div>  : null}
            </div>
        );
    }
}

export default TakeAttendancePage;