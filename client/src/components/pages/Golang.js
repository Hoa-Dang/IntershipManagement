import React, { Component } from 'react'
// import ReactToExcel from 'react-html-table-to-excel'
import { Row, Col, View, Card, CardBody, MDBIcon, MDBBtn ,MDBModal, MDBModalHeader,
  MDBModalBody,MDBInput } from 'mdbreact';
import MUIDataTable from "mui-datatables"; 

class Golang extends React.Component {
  constructor(){
    super();
    this.state = {
      courseName:"",
      startDate: "",
      endDate: "",
      detailList: []
    };
  }

  // Get data of course from DB
  GetCourse(){
    const DATE_OPTIONS = { year: 'numeric', month: 'numeric', day: 'numeric' };
    fetch('http://localhost:8080/coursename/Golang')
      .then(response => response.json())
        .then(result => {
          let DetailSchedule = []
          let cnt = 1
          result.Detail.map(row => {
            DetailSchedule.push([cnt, row.TrainingOutline, row.Content, row.DurationPlan, row.DurationActual, row.Objectives, row.TrainingMethod,
            (new Date(row.StartDate)).toLocaleDateString('en-US', DATE_OPTIONS), (new Date(row.EndDate)).toLocaleDateString('en-US', DATE_OPTIONS),
            row.Progress, row.Note])
            cnt++
            return DetailSchedule
          })
          this.setState({
            courseName : result.CourseName,
            // Format date time
            startDate : (new Date(result.StartDate)).toLocaleDateString('en-US', DATE_OPTIONS),
            endDate : (new Date(result.EndDate)).toLocaleDateString('en-US', DATE_OPTIONS),
            detailList : DetailSchedule,
        })
    });
  }

  // Show modal popup to edit data
  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  // Handle when change value in textbox
  handleChangeValue(e){
    const {name , value} = e.target;
    e.target.className = "form-control"
    switch (name) {
      case "durationplan":
        this.setState({durationPlan: value})
        break;
      case "durationactual":
        this.setState({durationActual: value})
        break;
      case "startdate":
        this.setState({startDate: value})
        break;
      case "enddate":
        this.setState({endDate: value})
        break;
      case "progress":
        this.setState({progress: value})
        break;
      case "note":
        this.setState({note: value})
        break;
      default:
        break;
    }
  }

  componentDidMount(){
    this.GetCourse();
  }

  // Value of header
  columnsHeader = [
    {
      name: "No",
      options: {
       filter: false,
       sort: true,
      }
     },
     {
      name: "Training Outline",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "Content",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "Duration Plan",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "Duration Actual",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "Objectives",
      options: {
       filter: false,
       sort: false,
      }
     },
     {
      name: "Training Method",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "Start Date",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "End Date",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "Progress",
      options: {
       filter: true,
       sort: false,
      }
     },
     {
      name: "Note",
      options: {
       filter: true,
       sort: false, 
      }
     },
  ]
  
  // Option of table (search, filter, ...)
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
    // Handle when click on row in table data
    onRowClick: (rowData, rowState) => {
      this.setState({
        durationPlan : rowData[3],
        durationActual : rowData[4],
        startDate : rowData[7],
        endDate : rowData[8],
        progress : rowData[9],
        note : rowData[10],
        title : "EDIT INFORMATION",
        icon : "edit",
        isUpdate : true
      });
      this.toggle()
    }
  }

  render(){
    return (
    <React.Fragment>
      <Row>
      <Col md="12">
        <Card className="mt-1">
          <View className="gradient-card-header blue darken-2">
            <h3 className="h3 text-white"><strong>Schedule Training</strong></h3>
          </View>
          <CardBody>
            <h4 className="mt-2 text-center">Course Name: {this.state.courseName}</h4>      
            <h5 className="text-center">From: {this.state.startDate} To: {this.state.endDate}</h5>  
            <MUIDataTable
              title={"Schedule Training"}
              data={this.state.detailList}
              columns={this.columnsHeader}
              options={this.options}/>  
            {/*Button to export data to excel file */}      
            {/* <ReactToExcel 
              id="test-table-xls-button"
              className="btn_export"
              table="table_exe"
              filename="Schedule"
              sheet="Schedule"
              buttonText="EXPORT"
            /> */}
          </CardBody>
        </Card>
      </Col>
    </Row>

    {/*Handle show modal and load data into modal popup */}  
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
              <MDBInput label="Duration Plan" icon="clock-o" name="durationplan" value={this.state.durationPlan} onChange={this.handleChangeValue.bind(this)}/>
              <MDBInput label="Duration Actual" icon="clock-o" name="durationactual" value={this.state.durationActual} onChange={this.handleChangeValue.bind(this)}/>
              <MDBInput label="Start Date" icon="calendar" iconClass="dark-grey" name="startdate" value={this.state.startDate} onChange={this.handleChangeValue.bind(this)}/>
              <MDBInput label="End Date" icon="calendar" name="enddate" value={this.state.endDate} onChange={this.handleChangeValue.bind(this)}/>
              <MDBInput label="Progress" icon="battery-1" name="progress" value={this.state.progress} onChange={this.handleChangeValue.bind(this)}/>
              <MDBInput label="Note" icon="address-book" name="note" value={this.state.note} onChange={this.handleChangeValue.bind(this)}/>
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
    </React.Fragment>
  )
  }

    
}

export default Golang;