import React from 'react';
import './report.css';
import $ from 'jquery';

class ReportPage extends React.Component {

    constructor(props) {
        super(props);
        var weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var date = new Date();
        var strDate = weekDays[date.getDay()] + ", " + months[date.getMonth()] + " " + this.getDate(date.getDate()) + ", " + date.getFullYear();
        this.state = {
            traineeId: JSON.parse(localStorage.getItem('user')).RoleID,
            currentDate: strDate,
            textSubject: "",
            textBody: "",
            showSuccess: false,
            showWarning: false,
            showError: false,
            disableButton: false
        };
    }

    onSubjectChange(event) {
        this.setState({textSubject: event.target.value});
    }
    onSubjectBlur(event) {
        this.setState({textSubject: event.target.value});
    }

    onBodyChange(event) {
        this.setState({textBody: event.target.value});
    }

    handleSubmit(event) {     
        this.resetAlerts();
        if(this.state.textSubject === "" || this.state.textBody === ""){
            this.setState({showWarning: true});
        } else {
            var data = {
                subject : document.getElementById("subject").value,
                body : document.getElementById("body").value
            };
   
            this.setState({disableButton: true});

            $.ajax({
                url: "http://localhost:8080/trainee/" + this.state.traineeId +"/report",
                type: "POST",
                data: JSON.stringify(data),
                success: function (response) {
                    if (response.status === "Success") {
                        this.setState({showSuccess: true});
                    } else {
                        this.setState({showError: true});
                    }
                    this.setState({disableButton: false});
                }.bind(this),
                error: function (xhr, status) {
                    this.setState({showError: true});
                    this.setState({disableButton: false});
                }.bind(this)
            });

        }
        event.preventDefault();
    }

    resetAlerts(){
        this.setState({showSuccess: false});
        this.setState({showWarning: false});
        this.setState({showError: false});
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

    render() {
        return (
            <div>
                {this.state.showSuccess ?
                <div className="alert alert-success">
                    Report sent successfully.
                </div> : null}
                {this.state.showWarning ?
                <div className="alert alert-warning custom-border">
                    You must fulfill subject and body.
                </div> : null}
                {this.state.showError ?
                <div className="alert alert-danger">
                    Send report failed.
                </div> : null}
                <div className="card mt-6">
                    <div className="col-example">
                        <h5 className="custom-margin">Report on <b>{this.state.currentDate}</b></h5>
                    </div>
                    <div className="card-body">             
                        <form onSubmit={this.handleSubmit.bind(this)}>
                            <div className="form-group">
                                <label htmlFor="subject"><b>Subject</b></label>
                                <input type="text" id="subject" name="subject" className="form-control" value={this.state.textSubject}
                                 onChange={this.onSubjectChange.bind(this)}
                                 onBlur={this.onSubjectBlur.bind(this)}/>
                            </div>
                            <hr/>
                            <div className="form-group">
                                <label htmlFor="body"><b>Body</b></label>
                                <textarea spellCheck="false" className="form-control" id="body" name="body" rows="5" value={this.state.textBody} onChange={this.onBodyChange.bind(this)}/>
                            </div>
                            <hr/>
                            <input type="submit" id="submit" className="btn btn-primary" value="Submit" disabled={this.state.disableButton}/>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default ReportPage;