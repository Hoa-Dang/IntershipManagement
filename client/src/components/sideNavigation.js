import React, { Component } from 'react';
import logo from "../assets/mdb-react.png";
import { ListGroup, ListGroupItem, Fa } from 'mdbreact';
import { NavLink } from 'react-router-dom';
import { MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem } from "mdbreact";

class TopNavigation extends Component {

    constructor () {
        super();
        this.state = {
            course : []
        }
    }
    
    // GetCourse () {
    //     fetch('http://localhost:8080/mentors')
    //     .then(response => response.json())
    //     .then(data => {
    //         let course = []
    //         let cnt = 1
    //         data.map(row => {
    //         NewData.push([cnt,row.ID,row.Name,row.PhoneNumber,row.Email,row.Gender?"Male":"Female",
    //         // format datetime
    //         (new Date(row.DoB)).toLocaleDateString('en-US', DATE_OPTIONS),
    //         row.Department,row.SupervisorID])
    //         cnt++
    //         return NewData
    //         })
    //         this.setState({
    //             mentorList : NewData
    //         })
    //     });
    // }
    render() {
        let role = JSON.parse(localStorage.getItem("user")).Role;
        return (
            <div className="sidebar-fixed position-fixed">
                <a href="#!" className="logo-wrapper waves-effect">
                    <img alt="MDB React Logo" className="img-fluid" src={logo} />
                </a>
                <ListGroup className="list-group-flush">
                    <NavLink exact={true} to="/" activeClassName="activeClass">
                        <ListGroupItem>
                            <Fa icon="pie-chart" className="mr-3"/>
                            Dashboard
                        </ListGroupItem>
                    </NavLink>
                    <NavLink to="/profile" activeClassName="activeClass">
                        <ListGroupItem>
                            <Fa icon="user" className="mr-3"/>
                            Profile
                        </ListGroupItem>
                    </NavLink>
                    <NavLink to="/attendance" activeClassName="activeClass">
                        <ListGroupItem>
                            <Fa icon="table" className="mr-3"/>
                            Attendance
                        </ListGroupItem>
                    </NavLink>
                    <NavLink to="/report" activeClassName="activeClass">
                        <ListGroupItem>
                            <Fa icon="edit" className="mr-3"/>
                            Report
                        </ListGroupItem>
                    </NavLink>
                    { role === 3 &&
                        <NavLink to="/tables" activeClassName="activeClass">
                            <ListGroupItem>
                                <Fa icon="table" className="mr-3"/>
                                User Management
                            </ListGroupItem>
                        </NavLink>
                    }
                    <MDBDropdown color = "white" className = "mr-3">
                        
                        <MDBDropdownToggle color="white">
                                
                        <ListGroupItem>
                            <Fa icon="exclamation" className="mr-3"/>
                            Course
                        </ListGroupItem>
                    
                            </MDBDropdownToggle>
                            <MDBDropdownMenu basic>
                                <MDBDropdownItem>
                                    <NavLink to="/course/java" >
                                        <ListGroupItem>
                                            <Fa icon="table" className="mr-3"/>
                                            Java
                                        </ListGroupItem>
                                    </NavLink>
                                </MDBDropdownItem>
                                <MDBDropdownItem>
                                    <NavLink to="/course/c#" >
                                        <ListGroupItem>
                                            <Fa icon="table" className="mr-3"/>
                                            C#
                                        </ListGroupItem>
                                    </NavLink>
                                </MDBDropdownItem>
                                <MDBDropdownItem>
                                    <NavLink to="/course/golang" >
                                        <ListGroupItem>
                                            <Fa icon="table" className="mr-3"/>
                                            Golang
                                        </ListGroupItem>
                                    </NavLink>
                                </MDBDropdownItem>
                            </MDBDropdownMenu>
                            
                    </MDBDropdown>
                    <NavLink to="/regiscourse" activeClassName="activeClass">
                        <ListGroupItem>
                            <Fa icon="table" className="mr-3"/>
                            Registration Course
                        </ListGroupItem>
                    </NavLink>      
                    
                </ListGroup>
            </div>
        );
    }
}
export default TopNavigation;