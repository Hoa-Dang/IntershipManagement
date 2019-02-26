import React from 'react'
import { Card, Col, Row, CardBody, CardTitle, CardFooter, MDBRow, MDBCol, MDBInput, DatePicker, MDBBtn, MDBIcon } from 'mdbreact';
// import src1 from '../../assets/img-1.jpg';

class ProfilePage extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      dataUser : ""
    }
  }

  componentDidMount () {
    let user = JSON.parse(localStorage.getItem("user"));
    if (user.Role === 1) {
      this.getDataTrainee(user.RoleId);
    }
  }

  getURL(url){
    let Url = "http://localhost:8080/";
    return Url += url;
  }

  getDataTrainee(id) {
    fetch(this.getURL("trainee/") + id)
    .then(response => response.json())
    .then(data => {
      this.setState({dataUser : data});
    });
  }

  handleChangeValue(e) {
    const {name , value} = e.target;
    e.target.className = "form-control";
    switch (name) {
      case "name":
        this.setState({name: value})
        if (value.trim().length === 0) {
          this.setState({
            name: " ",
            errorName : "Name can not be blank"
          });
          e.target.className += " invalid";
        } else if (value.trim().length < 6) {
          this.setState({
            errorName : "Name contains more than 5 characters"
          });
          e.target.className += " invalid";
        } else {
          e.target.className += " valid";
        }
        break;
      case "phone":
        this.setState({phone: value.trim()});
        e.target.className = "form-control";
        const regexPhone = /^[0-9\b]+$/;
        if (value.trim().length === 0) {
          this.setState({
            phone: " ",
            errorPhone : "Phone can not be blank"
          });
          e.target.className += " invalid";
        } else if (!regexPhone.test(value.trim())){
          this.setState({
            errorPhone : "Phone contains only numeric characters"
          });
          e.target.className += " invalid";
        } else {
          e.target.className += " valid";
        }
        break;
      case "email":
        this.setState({email: value.trim()});
        e.target.className = "form-control";
        const regexEmail = /^[a-zA-Z0-9]+@tma.com.vn$/;
        if (value.trim().length === 0) {
          this.setState({
            email: " ",
            errorEmail : "Email can not be blank"
          });
          e.target.className += " invalid";
        } else if (!regexEmail.test(value.trim())){
          this.setState({
            errorEmail : "Only use TMA email for register"
          });
          e.target.className += " invalid";
        } else {
          e.target.className += " valid";
        }
        break;
      case "gender":
        this.setState({gender: value});
        e.target.className = "form-control";
        // $(".fa-transgender").addClass("active");
        this.setState({
          errorGender : ""
        });
        if (e.target.value === "Choose Gender") {
          e.target.className += " invalid";
          this.setState({
            errorGender : "Please Choose Gender"
          });
        } else {
          e.target.className += " valid";
        }
        break;
      case "university":
        this.setState({university: value});
        e.target.className = "form-control";
        if (value.trim().length === 0) {
            this.setState({
              university: " ",
              errorUniversity : "University can not be blank"
            });
            e.target.className += " invalid";
        } else {
          e.target.className += " valid";
        }
        break;
      case "faculty":
        this.setState({faculty: value});
        e.target.className = "form-control";
        if (value.trim().length === 0) {
            this.setState({
              faculty: " ",
              errorFaculty : "Faculty can not be blank"
            });
            e.target.className += " invalid";
        } else {
          e.target.className += " valid";
        }
        break;
      case "mentor":
        this.setState({mentor: value});
        break;
      case "department":
        this.setState({department: value});
        e.target.className = "form-control";
        if (value.trim().length === 0) {
            this.setState({
              department: " ",
              errorDepartment : "Department can not be blank"
            });
            e.target.className += " invalid";
        } else {
          e.target.className += " valid";
        }
        break;
      default:
        break;
    }
  }

  render () {
    let data = this.state.dataUser;
    console.log(data);
    return (
      <React.Fragment>
          <Row className="justify-content-center">
          <Col md="6" lg="9">
          <section className="pb-3">
            <Row className="d-flex justify-content-center">
              <Col lg="6" xl="5" className="mb-3">
                <Card className="d-flex mb-5">
                <MDBRow>
                  <MDBCol>
                    <img src="https://mdbootstrap.com/img/Photos/Avatars/avatar-1.jpg" className="rounded mx-auto d-block" alt="aligment"/>
                  </MDBCol>
                </MDBRow>
                  <CardBody className = "text-center">
                    <CardTitle className="font-bold mb-3">
                      <strong>{data.Name}</strong>
                    </CardTitle>
                  </CardBody>
                  <CardFooter className="links-light profile-card-footer">
                    <MDBInput error={this.state.errorName} label="Name" icon="user" name="name" value={data.Name} onChange={this.handleChangeValue.bind(this)}/>
                    <MDBInput error={this.state.errorPhone} label="Phone" icon="phone" name="phone" value={data.Phone} onChange={this.handleChangeValue.bind(this)}/>
                    <MDBInput error={this.state.errorEmail} label="Email" icon="envelope" iconClass="dark-grey" name="email" value={data.Email} onChange={this.handleChangeValue.bind(this)}/>
                    <div className="md-form select-gender">
                      <i className="fa fa-transgender prefix"></i>
                      <select className="form-control" name="gender" value={data.Gender} onChange={this.handleChangeValue.bind(this)}>
                        <option>Choose Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <label className="errorGender">{this.state.errorGender}</label>
                    </div>
                    <div className="md-form select-dob">
                      <i className="fa fa-birthday-cake prefix"></i>
                      <DatePicker
                        onChange={this.onChangeDob}
                        value={data.Dob}
                        className="form-control"
                        name="dob"
                        calendarClassName="calendar"
                      />
                      <label className="errorGender">{this.state.errorDob}</label>
                    </div>
                    {/* <MDBInput error={this.state.errorDepartment} label="Department" icon="university" name="department" value={this.state.department} onChange={this.handleChangeValue.bind(this)}/>                */}
                    <div className="text-center mt-1-half">
                      <MDBBtn
                        className="mb-2 blue darken-2"
                        type="submit">
                        send
                        <MDBIcon icon="send" className="ml-1"/>
                      </MDBBtn>
                      {
                        this.state.isUpdate &&
                        <MDBBtn
                        className="mb-2 blue darken-2"
                        onClick={this.handlerDeleteMentor}>
                        delete
                        <MDBIcon icon="trash" className="ml-1"/>
                        </MDBBtn>
                      }
                    </div>
                  </CardFooter>
                </Card>
              </Col>
            </Row>
          </section>
        </Col>
      </Row>
      </React.Fragment>
    );
  }
}

export default ProfilePage;