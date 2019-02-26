import React, { Component } from 'react';
import XLSX from 'xlsx';
import { Row, Col, View, Card, CardBody, MDBContainer, MDBRow, MDBCol, MDBBtn } from 'mdbreact';

class RegistrationCourse extends Component {
  constructor(props){
    super(props);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.saveDB = this.saveDB.bind(this);
    this.state={
      data: {
        "courseName": "",
        "timeStart": "",
        "timeEnd": "",
        "scheduleContent":""
      }
    }
  };

  // Read the content of xlsx file
  onChangeInput(event){
    let file =event.target.files[0];
    const reader = new FileReader();
    if(file){
      let data = new FormData();
      data.append('file', file);
      reader.onload = (evt) =>{
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, {type:'binary'});
        let wsname = wb.SheetNames[0];
        console.log("sheet name: " + wsname);
        let ws = wb.Sheets[wsname] ;
        console.log("name: " + ws);
        let data = XLSX.utils.sheet_to_csv(ws, {header:1});
        this.state.data.scheduleContent = data;
        console.log("Data: " + this.state.data.scheduleContent)
      };
      reader.readAsBinaryString(file);
    }
  }

  // Save the content into database
  saveDB(){

  }
  render(){
    return (
      <React.Fragment>
        <Row>
        <Col md="12">
          <Card className="mt-1">
            <View className="gradient-card-header blue darken-2">
              <h3 className="h3 text-white"><strong>Registration Course</strong></h3>
            </View>
            <CardBody>
              {/*<h4 className="mt-2 text-center">Course Name: Go Language</h4>      
              <h5 className="text-center">From: 9/2018 To: 10/2019</h5>*/}
              <MDBContainer>
                <MDBRow>
                  <MDBCol md="6">
                    <form className="row">
                      <label htmlFor="defaultFormRegisterNameEx" className="grey-text col-md-3 mt-2">
                        Course Name*
                      </label>
                      <input
                        type="text"
                        id="defaultFormRegisterNameEx"
                        className="form-control col-md-9 mt-2"
                      />
                      <br />
                      <label htmlFor="defaultFormRegisterEmailEx" className="grey-text col-md-3 mt-2">
                        Time start*
                      </label>
                      <input
                        type="email"
                        id="defaultFormRegisterEmailEx"
                        className="form-control col-md-9 mt-2"
                      />
                      <br />
                      <label
                        htmlFor="defaultFormRegisterConfirmEx"
                        className="grey-text col-md-3 mt-2"
                      >
                        Time End*
                      </label>
                      <input
                        type="email"
                        id="defaultFormRegisterConfirmEx"
                        className="form-control col-md-9 mt-2"
                      />
                      <br />
                      <label
                        htmlFor="defaultFormRegisterPasswordEx"
                        className="grey-text col-md-3 mt-2"
                      >
                        Your password
                      </label>
                      <input
                        type="password"
                        id="defaultFormRegisterPasswordEx"
                        className="form-control col-md-9 mt-2"
                      />
                      <div className="input-group mt-2">
                        <label
                          htmlFor="defaultFormRegisterPasswordEx"
                          className="grey-text col-md-3 mt-2"
                        >
                          Schedule File
                        </label>
                        <div className="custom-file col-md-9">
                          <input
                            onChange = {this.onChangeInput}
                            type="file"
                            className=""
                            id="inputGroupFile01"
                            aria-describedby="inputGroupFileAddon01"
                          />
                          <label className="custom-file-label" htmlFor="inputGroupFile01">
                            Choose file
                          </label>
                          {/* <ReactFileReader fileTypes={[".csv",".zip"]} base64={true} multipleFiles={true} handleFiles={this.handleFiles}>
                            <button className='btn'>Upload</button>
                          </ReactFileReader> */}
                        </div>
                      </div>
                      <div className="text-center mt-4">
                        <MDBBtn color="unique" type="submit">
                          Register
                        </MDBBtn>
                      </div>
                    </form>
                  </MDBCol>
                </MDBRow>
              </MDBContainer>
            </CardBody>
          </Card>
        </Col>
      </Row>
      </React.Fragment>
    )
  }
  
}

export default RegistrationCourse;