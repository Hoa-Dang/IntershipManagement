import React from 'react'
import './user.css'
import { Row, Col, Card ,MDBModal, MDBModalHeader, MDBIcon,
  MDBModalBody,MDBInput,MDBBtn} from 'mdbreact';
import MUIDataTable from "mui-datatables";

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import NoSsr from '@material-ui/core/NoSsr';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Tab from '@material-ui/core/Tab';
import DatePicker from 'react-date-picker';
import $ from 'jquery';

/* Import MUIDataTable using command "npm install mui-datatables --save" */

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

function LinkTab(props) {
  return <Tab component="a" onClick={event => event.preventDefault()} {...props} />;
}

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  main: {
    backgroundColor: "#007bff",
  }
});

class UserPage extends React.Component{
  
  getURL(url){
    let Url = "http://localhost:8080/"
    return Url += url
  }

  constructor() {
    super();
    this.state = {
      modal: false,
      modalMentor: false,
      traineeList: [],
      value : 0,
      courseList: [],
      isUpdate : false,
      user : JSON.parse(localStorage.getItem("user"))
    };
  }

  onChangeDob = dob => {
    this.setState({ dob })
    this.setState({
      errorDob : ""
    })
    $(".fa-birthday-cake").addClass("active")
    var age = Math.floor((new Date() - new Date(dob)) / 1000 / 60 / 60 / 24 / 365.25)
    if (dob === null) {
      this.setState({
        errorDob : "Please Choose Day of birth"
      })
      $(".react-date-picker__wrapper").addClass("invalid")
    } else if (age <= 18){
      this.setState({
        errorDob : "Applicants must be over 18 years of age"
      })
      $(".react-date-picker__wrapper").addClass("invalid")
    } else {
      $(".react-date-picker__wrapper").removeClass("invalid")
      $(".react-date-picker__wrapper").addClass("valid")
    }
  }

  GetCourseList(){
    fetch(this.getURL("courses"))
      .then(response => response.json())
      .then(data => {
        this.setState({
          courseList : data
        })
      });
  }

  GetCourseListByMentor(){
    fetch(this.getURL("courses/" + this.state.user.RoleID))
      .then(response => response.json())
      .then(data => {
        this.setState({
          courseList : data
        })
      });
  }

  GetTraineeListByMentor(){
    const DATE_OPTIONS = { year: 'numeric', month: 'numeric', day: 'numeric' };
    fetch(this.getURL("trainees/" + this.state.user.RoleID))
      .then(response => response.json())
      .then(data => {
        let NewData = []
        let cnt = 1
        if (data !== null) {
          data.reverse().map(row => {
            NewData.push([cnt,row._id,row.Name,row.PhoneNumber,row.Email,row.Gender?"Male":"Female",
            // format datetime
            (new Date(row.DayofBirth)).toLocaleDateString('en-US', DATE_OPTIONS),
            row.University,row.Faculty,row.CourseID])
            cnt++
            return NewData
          })
        }  
        this.setState({
          traineeList : NewData
        })
      });
  }

  GetTraineeList(){
    const DATE_OPTIONS = { year: 'numeric', month: 'numeric', day: 'numeric' };
    fetch(this.getURL("trainees"))
      .then(response => response.json())
      .then(data => {
        let NewData = []
        let cnt = 1
        data.reverse().map(row => {
          NewData.push([cnt,row._id,row.Name,row.PhoneNumber,row.Email,row.Gender?"Male":"Female",
          // format datetime
          (new Date(row.DayofBirth)).toLocaleDateString('en-US', DATE_OPTIONS),
          row.University,row.Faculty,row.CourseID,row.CourseName,row.MentorName])
          cnt++
          return NewData
        })
        this.setState({
          traineeList : NewData
        })
      });
  }

  GetMentorList(){
    const DATE_OPTIONS = { year: 'numeric', month: 'numeric', day: 'numeric' };
    fetch(this.getURL("mentors"))
      .then(response => response.json())
      .then(data => {
        let NewData = []
        let cnt = 1
        data.reverse().map(row => {
          NewData.push([cnt,row._id,row.Name,row.PhoneNumber,row.Email,row.Gender?"Male":"Female",
          // format datetime
          (new Date(row.DayofBirth)).toLocaleDateString('en-US', DATE_OPTIONS),
          row.Department])
          cnt++
          return NewData
        })
        this.setState({
          mentorList : NewData
        })
      });
  }

  handleChangeTab = (event, value) => {
    this.setState({ value });
  };

  componentDidMount(){
    if (this.state.user.Role !== 3) {
      if (this.state.user.Role === 2) {
        this.GetTraineeListByMentor()
        this.GetCourseListByMentor()
      } else {
        this.GetTraineeList()
        this.GetMentorList()
        this.GetCourseList()
      }
    }
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
    setTimeout(() => {
      if (this.state.icon === "edit") {
        $(".fa-birthday-cake").addClass("active")
        $(".fa-transgender").addClass("active")
      }
    },100)
  };

  toggleMentor = () => {
    this.setState({
      modalMentor: !this.state.modalMentor
    }) 
    setTimeout(() => {
      if (this.state.icon === "edit") {
        $(".fa-birthday-cake").addClass("active")
        $(".fa-transgender").addClass("active")
      }
    },100)
  };

  addUser = () => {
    this.setState({
      name : "",
      phone : "",
      email : "",
      gender : "",
      dob : "",
      university : "",
      faculty : "",
      mentor : "",
      title : "ADD NEW USER",
      icon : "plus",
      isUpdate : false,
      errorGender : "",
      errorDob: ""
    });
    this.toggle()
  }

  addMentor = () => {
    this.setState({
      name : "",
      phone : "",
      email : "",
      gender : "",
      dob : "",
      department : "",
      title : "ADD NEW MENTOR",
      icon : "plus",
      isUpdate : false,
      errorGender : "",
      errorDob: ""
    });
    this.toggleMentor()
  }

  validationData(e){
    let check = true
    // Check Validation for Name
    e.target.name.className = "form-control"
    if (e.target.name.value.trim().length === 0) {
        this.setState({
          name: " ",
          errorName : "Name can not be blank"
        })
        e.target.name.className += " invalid"
        check = false
    } else if (e.target.name.value.trim().length < 6) {
      this.setState({
        errorName : "Name contains more than 5 characters"
      })
      e.target.name.className += " invalid"
      check = false
    } else {
      e.target.name.className += " valid"
    }
    // End check Name

    // Check for Phone
    e.target.phone.className = "form-control"
    const regexPhone = /^[0-9\b]+$/
    if (e.target.phone.value.trim().length === 0) {
      this.setState({
        phone: " ",
        errorPhone : "Phone can not be blank"
      })
      e.target.phone.className += " invalid"
      check = false
    } else if (!regexPhone.test(e.target.phone.value.trim())){
      this.setState({
        errorPhone : "Phone contains only numeric characters"
      })
      e.target.phone.className += " invalid"
      check = false
    } else {
      e.target.phone.className += " valid"
    }
    // End check Phone

    // Check for Email
    e.target.email.className = "form-control"
    const regexEmail = /^[a-zA-Z0-9]+@tma.com.vn$/
    if (e.target.email.value.trim().length === 0) {
      this.setState({
        email: " ",
        errorEmail : "Email can not be blank"
      })
      e.target.email.className += " invalid"
      check = false
    } else if (!regexEmail.test(e.target.email.value.trim())){
      this.setState({
        errorEmail : "Only use TMA email for register"
      })
      e.target.email.className += " invalid"
      check = false
    } else {
      e.target.email.className += " valid"
    }
    // End check Email

    // Check for Gender
    e.target.gender.className = "form-control"
    this.setState({
      errorGender : ""
    })
    $(".fa-transgender").addClass("active")
    if (e.target.gender.value === "Choose Gender") {
      e.target.gender.className += " invalid"
      this.setState({
        errorGender : "Please Choose Gender"
      })
      check = false
    } else {
      e.target.gender.className += " valid"
    }
    // End check Gender

    // Check for Day Of Birth
    this.setState({
      errorDob : ""
    })
    $(".fa-birthday-cake").addClass("active")
    var age = Math.floor((new Date() - new Date(e.target.dob.value)) / 1000 / 60 / 60 / 24 / 365.25)
    if (e.target.dob.value === "") {
      this.setState({
        errorDob : "Please Choose Day of birth"
      })
      check = false
      $(".react-date-picker__wrapper").addClass("invalid")
    } else if (age <= 18){
      this.setState({
        errorDob : "Applicants must be over 18 years of age"
      })
      check = false
      $(".react-date-picker__wrapper").addClass("invalid")
    } else {
      $(".react-date-picker__wrapper").removeClass("invalid")
      $(".react-date-picker__wrapper").addClass("valid")
    }
    // End check Day Of Birth

    // Check Validation for University field
    if (e.target.university !== undefined) {
        e.target.university.className = "form-control"
      if (e.target.university.value.trim().length === 0) {
          this.setState({
            university: " ",
            errorUniversity : "University can not be blank"
          })
          e.target.university.className += " invalid"
          check = false
      } else {
        e.target.university.className += " valid"
      }
    }   
    // End check University field

    // Check Validation for Faculty field
    if (e.target.faculty !== undefined) {
        e.target.faculty.className = "form-control"
      if (e.target.faculty.value.trim().length === 0) {
          this.setState({
            faculty: " ",
            errorFaculty : "Faculty can not be blank"
          })
          e.target.faculty.className += " invalid"
          check = false
      } else {
        e.target.faculty.className += " valid"
      }
    }   
    // End check Faculty field

    // Check Validation for Department field
    if (e.target.department !== undefined) {
        e.target.department.className = "form-control"
      if (e.target.department.value.trim().length === 0) {
          this.setState({
            department: " ",
            errorDepartment : "Department can not be blank"
          })
          e.target.department.className += " invalid"
          check = false
      } else {
        e.target.department.className += " valid"
      }
    }   
    // End check University field

    return check
  }

  handlerAdd = (e) => {
    e.preventDefault()   
    if (this.validationData(e)) {
      if (this.state.icon === "edit") {
        // Update information for Trainee
        const data = {
          "ID" : this.state.id.trim(),
          "Name" : this.state.name.trim(),
          "PhoneNumber" : this.state.phone.trim(),
          "Email" : this.state.email.trim(),
          "Gender" : this.state.gender === "Male"?true:false,
          "DoB" : this.state.dob,
          "University" : this.state.university.trim(),
          "Faculty" : this.state.faculty.trim(),
          "CourseID" : this.state.course,
          "IsDeleted" : false
        }
        fetch(this.getURL("trainee"),
            {
                method: "PUT",
                headers:{
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(() => {
              if (this.state.user.Role === 2) {
                this.GetTraineeListByMentor()
              } else {
                this.GetTraineeList()
              }        
            })
        this.toggle()
      } else {
        // Create New Trainee
        const data = {
          "Name" : this.state.name.trim(),
          "PhoneNumber" : this.state.phone.trim(),
          "Email" : this.state.email.trim(),
          "Gender" : this.state.gender === "Male"?true:false,
          "DoB" : this.state.dob,
          "University" : this.state.university.trim(),
          "Faculty" : this.state.faculty.trim(),
          "CourseID" : this.state.course,
          "IsDeleted" : false
        }
        fetch(this.getURL("trainee"),
            {
                method: "POST",
                mode: "no-cors",
                headers:{
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(() => {
              this.GetTraineeList()
            })
        this.toggle()
      }
    }
  }

  handlerAddMentor = (e) => {
    e.preventDefault()   
    if (this.validationData(e)) {
      if (this.state.icon === "edit") {
        // Update information for Mentor
        const data = {
          "ID" : this.state.id.trim(),
          "Name" : this.state.name.trim(),
          "PhoneNumber" : this.state.phone.trim(),
          "Email" : this.state.email.trim(),
          "Gender" : this.state.gender === "Male"?true:false,
          "DoB" : this.state.dob,
          "Department" : this.state.department.trim(),
        }
        fetch(this.getURL("mentor"),
            {
                method: "PUT",
                headers:{
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(() => {
              this.GetMentorList()
            })
        this.toggleMentor()
      } else {
        // Insert new Mentor
        //const dt  = this.state.dob.split(/\-|\s|\//)
        //let date = new Date(dt[2], dt[1] - 1, dt[0])
        const data = {
          "Name" : this.state.name.trim(),
          "PhoneNumber" : this.state.phone.trim(),
          "Email" : this.state.email.trim(),
          "Gender" : this.state.gender === "Male"?true:false,
          "DoB" : this.state.dob,
          "Department" : this.state.department.trim(),
          "SupervisorID" : "5c1a11b49ef458a033e70628",
          "IsDeleted" : false
        }
        fetch(this.getURL("mentor"),
            {
                method: "POST",
                mode: "no-cors",
                headers:{
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(() => {
              this.GetMentorList()
            })
        this.toggleMentor()
      }
    }
  }
 
  handlerDelete = () => {
    let data = [
      [1,'Tiger Nixon','0156485446','tiger@hotmail.com','male','2007/05/28','Qui Nhon University','Information Technology','Lucas'],
      [2,'Jesse Welch','0154841212','jesse@hotmail.com','female','2011/04/14','Qui Nhon University','Information Technology','Memphis'],
      [3,'Eli Mejia','0484812115','eli@hotmail.com','female','2011/04/05','Qui Nhon University','Information Technology','Lucas'],
      [4,'Gene Leblanc','051321446','gene@hotmail.com','male','2006/06/12','Qui Nhon University','Information Technology','Memphis'],
      [5,'Danny Leon','0561848446','danny@hotmail.com','male','2011/05/25','Qui Nhon University','Information Technology','Lucas'],
      [6,'Franky Miles','01321585446','franky@hotmail.com','male','2005/11/21','Qui Nhon University','Information Technology','Lucas'],
      [7,'Silver Carey','011815446','silver@hotmail.com','male','2010/12/30','Qui Nhon University','Information Technology','Baltimore'],
      [8,'Justice Mccarthy','0115515446','justice@hotmail.com','female','2011/12/14','Qui Nhon University','Information Technology','Baltimore'],
      [9,'Terry Macdonald','01548814446','terry@hotmail.com','male','2007/07/15','Qui Nhon University','Information Technology','Memphis'],
      [10,'Danni Hudson','0456488486','danni@hotmail.com','male','2009/01/14','Qui Nhon University','Information Technology','Baltimore'],
      [11,'Jesse Hall','0489849454','jesse@hotmail.com','female','2011/01/13','Qui Nhon University','Information Technology','Memphis'],
      [12,'Lane Lee','0564846841','lane@hotmail.com','female','2011/02/24','Qui Nhon University','Information Technology','Lucas'],
    ]
    data.splice(this.state.id - 1,1)
    this.setState({
      data : data
    })
    this.toggle()
  }

  handlerDeleteMentor = () => {
    fetch(this.getURL("mentor/") + this.state.id, {
      method: 'DELETE'
    })
    .then(()=>{
      this.GetMentorList()
    })
    this.toggleMentor()
  }

  columns = [
    {
      name: "#",
      options: {
       filter: false,
       sort: true,
      }
     },
    {
      name: "ID",
      options: {
       filter: false,
       sort: false,
       display: "excluded",
      }
     },
     {
      name: "NAME",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "PHONE",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "EMAIL",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "GENDER",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "DAY OF BIRTH",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "UNIVERSITY",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "FACULTY",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "COURSEID",
      options: {
       filter: false,
       sort: false,
       display: "excluded",
      }
     },
     {
      name: "COURSE",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "MENTOR",
      options: {
       filter: true,
       sort: false,
      }
     },
  ]

  columnsForMentor = [
    {
      name: "#",
      options: {
       filter: false,
       sort: true,
      }
     },
    {
      name: "ID",
      options: {
       filter: false,
       sort: false,
       display: "excluded",
      }
     },
     {
      name: "NAME",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "PHONE",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "EMAIL",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "GENDER",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "DAY OF BIRTH",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "UNIVERSITY",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "FACULTY",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "COURSEID",
      options: {
       filter: false,
       sort: false,
       display: "excluded",
      }
     },
  ]

  columnsMentor = [
    {
      name: "#",
      options: {
       filter: false,
       sort: true,
      }
     },
     {
      name: "ID",
      options: {
       filter: false,
       sort: false,
       display: "excluded"
      }
     },
     {
      name: "NAME",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "PHONE",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "EMAIL",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "GENDER",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "DAY OF BIRTH",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "DEPARTMENT",
      options: {
       filter: true,
       sort: false,
      }
     },
  ]

  options = {
    filterType: "dropdown",
    responsive: "scroll",
    download : false,
    print : false,
    selectableRows : false,
    textLabels: {
      body: {
        noMatch: "Sorry, no matching records found",
        toolTip: "Sort",
      },
      pagination: {
        next: "Next Page",
        previous: "Previous Page",
        rowsPerPage: "Rows per page:",
        displayRows: "of",
      },
      toolbar: {
        search: "Search",
        downloadCsv: "Download CSV",
        print: "Print",
        viewColumns: "View Columns",
        filterTable: "Filter Table",
      },
      filter: {
        all: "All",
        title: "FILTERS",
        reset: "RESET",
      },
      viewColumns: {
        title: "Show Columns",
        titleAria: "Show/Hide Table Columns",
      },
      selectedRows: {
        text: "rows(s) selected",
        delete: "Delete",
        deleteAria: "Delete Selected Rows",
      },
    },
    onRowClick: (rowData, rowState) => {
      $(".fa-birthday-cake").addClass("active");
      $(".fa-transgender").addClass("active");
      this.setState({
        id : rowData[1],
        name : rowData[2],
        phone : rowData[3],
        email : rowData[4],
        gender : rowData[5],
        dob : new Date(rowData[6]),
        university : rowData[7],
        faculty : rowData[8],
        course : rowData[9],
        title : "EDIT INFORMATION",
        icon : "edit",
        isUpdate : true,
        errorDob : "",
        errorGender : ""
      });
      this.toggle()
    }
  }

  optionsMentor = {
    filterType: "dropdown",
    responsive: "scroll",
    download : false,
    print : false,
    selectableRows : false,
    textLabels: {
      body: {
        noMatch: "Sorry, no matching records found",
        toolTip: "Sort",
      },
      pagination: {
        next: "Next Page",
        previous: "Previous Page",
        rowsPerPage: "Rows per page:",
        displayRows: "of",
      },
      toolbar: {
        search: "Search",
        downloadCsv: "Download CSV",
        print: "Print",
        viewColumns: "View Columns",
        filterTable: "Filter Table",
      },
      filter: {
        all: "All",
        title: "FILTERS",
        reset: "RESET",
      },
      viewColumns: {
        title: "Show Columns",
        titleAria: "Show/Hide Table Columns",
      },
      selectedRows: {
        text: "rows(s) selected",
        delete: "Delete",
        deleteAria: "Delete Selected Rows",
      },
    },
    onRowClick: (rowData, rowState) => {
      this.setState({
        id : rowData[1],
        name : rowData[2],
        phone : rowData[3],
        email : rowData[4],
        gender : rowData[5],
        dob : new Date(rowData[6]),
        department : rowData[7],
        title : "EDIT INFORMATION",
        icon : "edit",
        isUpdate : true,
        errorDob : "",
        errorGender : ""
      });
      this.toggleMentor()
    }
  }

  handleChangeValue(e) {
    const {name , value} = e.target;
    e.target.className = "form-control"
    switch (name) {
      case "name":
        this.setState({name: value})
        if (value.trim().length === 0) {
          this.setState({
            name: " ",
            errorName : "Name can not be blank"
          })
          e.target.className += " invalid"
        } else if (value.trim().length < 6) {
          this.setState({
            errorName : "Name contains more than 5 characters"
          })
          e.target.className += " invalid"
        } else {
          e.target.className += " valid"
        }
        break;
      case "phone":
        this.setState({phone: value.trim()})
        e.target.className = "form-control"
        const regexPhone = /^[0-9\b]+$/
        if (value.trim().length === 0) {
          this.setState({
            phone: " ",
            errorPhone : "Phone can not be blank"
          })
          e.target.className += " invalid"
        } else if (!regexPhone.test(value.trim())){
          this.setState({
            errorPhone : "Phone contains only numeric characters"
          })
          e.target.className += " invalid"
        } else {
          e.target.className += " valid"
        }
        break;
      case "email":
        this.setState({email: value.trim()})
        e.target.className = "form-control"
        const regexEmail = /^[a-zA-Z0-9]+@tma.com.vn$/
        if (value.trim().length === 0) {
          this.setState({
            email: " ",
            errorEmail : "Email can not be blank"
          })
          e.target.className += " invalid"
        } else if (!regexEmail.test(value.trim())){
          this.setState({
            errorEmail : "Only use TMA email for register"
          })
          e.target.className += " invalid"
        } else {
          e.target.className += " valid"
        }
        break;
      case "gender":
        this.setState({gender: value})
        e.target.className = "form-control"
        $(".fa-transgender").addClass("active");
        this.setState({
          errorGender : ""
        })
        if (e.target.value === "Choose Gender") {
          e.target.className += " invalid"
          this.setState({
            errorGender : "Please Choose Gender"
          })
        } else {
          e.target.className += " valid"
        }
        break;
      case "university":
        this.setState({university: value})
        e.target.className = "form-control"
        if (value.trim().length === 0) {
            this.setState({
              university: " ",
              errorUniversity : "University can not be blank"
            })
            e.target.className += " invalid"
        } else {
          e.target.className += " valid"
        }
        break;
      case "faculty":
        this.setState({faculty: value})
        e.target.className = "form-control"
        if (value.trim().length === 0) {
            this.setState({
              faculty: " ",
              errorFaculty : "Faculty can not be blank"
            })
            e.target.className += " invalid"
        } else {
          e.target.className += " valid"
        }
        break;
      case "course":
        this.setState({course: value})
        break;
      case "department":
        this.setState({department: value})
        e.target.className = "form-control"
        if (value.trim().length === 0) {
            this.setState({
              department: " ",
              errorDepartment : "Department can not be blank"
            })
            e.target.className += " invalid"
        } else {
          e.target.className += " valid"
        }
        break;
      default:
        break;
    }
  }

  render(){
    const { classes } = this.props;
    const { value } = this.state;
    const options = this.state.courseList.map((value , key) => {
      return (<option key={key} value={value._id}>{value.CourseName +" - "+ value.MentorName}</option>)
    })
    let columns = []
    if (this.state.user.Role === 2) {
      columns = this.columnsForMentor
    } else if (this.state.user.Role === 1) {
      columns = this.columns
    }
    return (
      <React.Fragment>
        <Row>
          <Col md="12">
            <Card className="mt-5">
              <NoSsr>
                <div className={classes.root}>
                  <AppBar position="static" className={classes.main}>
                    <Tabs fullWidth value={value} onChange={this.handleChangeTab}>
                      <LinkTab label="Trainee List" href="page1" />
                      { this.state.user.Role === 1 && <LinkTab label="Mentor List" href="page2" />}
                    </Tabs>
                  </AppBar>
                </div>
              </NoSsr>
                {value === 0 && 
                  <TabContainer>
                    <MDBBtn
                      className="mb-3 blue darken-2"
                      onClick={this.addUser}>
                      Add New Trainee
                      <MDBIcon icon="plus" className="ml-1" />
                    </MDBBtn> 
                    <MUIDataTable
                    title={"Trainee List"}
                    data={this.state.traineeList}
                    columns={columns}
                    options={this.options}/>
                  </TabContainer>}

                { this.state.user.Role === 1 && value === 1 && 
                  <TabContainer>
                    <MDBBtn
                      className="mb-3 blue darken-2"
                      onClick={this.addMentor}>
                      Add New Mentor
                      <MDBIcon icon="plus" className="ml-1" />
                    </MDBBtn> 
                    <MUIDataTable
                    title={"Mentor List"}
                    data={this.state.mentorList}
                    columns={this.columnsMentor}
                    options={this.optionsMentor}/>
                  </TabContainer>}
            </Card>
          </Col>
          {
            /* Show form add and update for trainee */
          }
          <MDBModal
          isOpen={this.state.modal}
          toggle={this.toggle}
          size="md"
          cascading>
            <MDBModalHeader
              toggle={this.toggle}
              titleClass="d-inline title"
              className="text-center light-blue darken-3 white-text">
              <MDBIcon icon={this.state.icon} />
              {this.state.title}
            </MDBModalHeader>
            <form onSubmit={this.handlerAdd} noValidate>
            <MDBModalBody>
              <MDBInput error={this.state.errorName} label="Name" icon="user" name="name" value={this.state.name} onChange={this.handleChangeValue.bind(this)}/>
              <MDBInput error={this.state.errorPhone} label="Phone" icon="phone" name="phone" value={this.state.phone} onChange={this.handleChangeValue.bind(this)}/>
              <MDBInput error={this.state.errorEmail} label="Email" icon="envelope" iconClass="dark-grey" name="email" value={this.state.email} onChange={this.handleChangeValue.bind(this)}/>
              <div className="md-form select-gender">
                <i className="fa fa-transgender prefix"></i>
                <select className="form-control" name="gender" value={this.state.gender} onChange={this.handleChangeValue.bind(this)}>
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
                  value={this.state.dob}
                  className="form-control"
                  name="dob"
                  calendarClassName="calendar"
                />
                <label className="errorGender">{this.state.errorDob}</label>
              </div>
              <MDBInput error={this.state.errorUniversity} label="University" icon="university" name="university" value={this.state.university} onChange={this.handleChangeValue.bind(this)}/>
              <MDBInput error={this.state.errorFaculty} label="Faculty" icon="bookmark" name="faculty" value={this.state.faculty} onChange={this.handleChangeValue.bind(this)}/>  
              <select className="browser-default custom-select" name="course" value={this.state.course} onChange={this.handleChangeValue.bind(this)}>
                <option>Choose Course</option>
                {options}
              </select>
              <div className="text-center mt-1-half">
                <MDBBtn
                  className="mb-2 blue darken-2"
                  type="submit"
                  >
                  send
                  <MDBIcon icon="send" className="ml-1"/>
                </MDBBtn>
                {
                  this.state.isUpdate &&
                  <MDBBtn
                  className="mb-2 blue darken-2"
                  onClick={this.handlerDelete}>
                  delete
                  <MDBIcon icon="trash" className="ml-1"/>
                  </MDBBtn>
                }
              </div>
            </MDBModalBody>
            </form>
          </MDBModal>
          {
            /* Show form add and update for mentor */
          }
          <MDBModal
          isOpen={this.state.modalMentor}
          toggle={this.toggleMentor}
          size="md"
          cascading>
            <MDBModalHeader
              toggle={this.toggleMentor}
              titleClass="d-inline title"
              className="text-center light-blue darken-3 white-text">
              <MDBIcon icon={this.state.icon} />
              {this.state.title}
            </MDBModalHeader>
            <form onSubmit={this.handlerAddMentor} noValidate>
              <MDBModalBody>
                <MDBInput error={this.state.errorName} label="Name" icon="user" name="name" value={this.state.name} onChange={this.handleChangeValue.bind(this)}/>
                <MDBInput error={this.state.errorPhone} label="Phone" icon="phone" name="phone" value={this.state.phone} onChange={this.handleChangeValue.bind(this)}/>
                <MDBInput error={this.state.errorEmail} label="Email" icon="envelope" iconClass="dark-grey" name="email" value={this.state.email} onChange={this.handleChangeValue.bind(this)}/>
                <div className="md-form select-gender">
                  <i className="fa fa-transgender prefix"></i>
                  <select className="form-control" name="gender" value={this.state.gender} onChange={this.handleChangeValue.bind(this)}>
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
                    value={this.state.dob}
                    className="form-control"
                    name="dob"
                    calendarClassName="calendar"
                  />
                  <label className="errorGender">{this.state.errorDob}</label>
                </div>
                <MDBInput error={this.state.errorDepartment} label="Department" icon="university" name="department" value={this.state.department} onChange={this.handleChangeValue.bind(this)}/>               
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
              </MDBModalBody>
            </form>
          </MDBModal>
        </Row>
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(UserPage);