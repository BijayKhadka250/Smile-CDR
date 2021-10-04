import Axios from 'axios'
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {Button, Table, Row, Col, Form , Alert} from "react-bootstrap"
import { ThemeConsumer } from 'react-bootstrap/esm/ThemeProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons'
import _ from 'lodash'
import './App.css'

function App() {

  const [patientsArray, setPatientArray ] =useState([])
  const [order, setOrder] = useState("")
  const [orderBirth, setOrderBirth] = useState("")
  const [column, setColumn] =useState("")
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstNameError, setFirstNameError] = useState("")
  const [lastNameError, setLastNameError] = useState("")
  const [searchError, setSearchError] = useState("")
  const [successResult, setSuccessResult] = useState("")
  const [SearchData, setSearchData] = useState([])
  const [responseTime, setResponseTime] = useState("")

  const formatData = (data) => {
    let newArray = []
    data.map(item => {
      let temp = {}
     let name = item.resource.name
      if (name === undefined){
        temp.name = "-----"
      }else{
        
        let givenName = name[0].given
      givenName = givenName.join(" ")
        let firstName = givenName
        let lastName = name[0].family
        let suffix = ""
        if(name[0].suffix){
            suffix = name[0].suffix + " "
        }
        temp.name = suffix + firstName+ " " + lastName
        
      }

      let birthDate = item.resource.birthDate
      if(birthDate === undefined){
        temp.birthDate = "----"
      }else{
        temp.birthDate = birthDate.split("T")[0]
      }

      let address = item.resource.address
      if(address === undefined){
        temp.street ="----"
        temp.city = "----"
        temp.district ="----"
        temp.state = "----"
        temp.country = "----"
        temp.postalCode = "----"
      }else{
        temp.street =  address[0].line ? address[0].line[0] : "----"
        temp.city = address[0].city ? address[0].city : "----"
        temp.district = address[0].district ? address[0].district : "----"
        temp.state = address[0].state ? address[0].state : "----"
        temp.country = address[0].country ? address[0].country : "----"
        temp.postalCode = address[0].postalCode ? address[0].postalCode : "----"
      }

      let gender = item.resource.gender
      if(gender === undefined){
        temp.gender = "----"
      }else{
        temp.gender = gender
      }

      let phoneNumber = item.resource.telecom
      if(phoneNumber === undefined){
        temp.phoneNumber = "----"
      }else{
        temp.phoneNumber = phoneNumber[0].value
      }
      console.log("phoneNumber",phoneNumber);
      console.log("temp",temp);
      newArray.push(temp)
    })

    return newArray
  }

  useEffect(() => {
    let startTime = new Date().getTime();
    Axios.get("https://try.smilecdr.com/baseR4/Patient").then((response) => {
      let time = new Date().getTime() - startTime
      setResponseTime(time)
      console.log('time', time);
      console.log("response", response);
      let data = response.data.entry
      let formatterArray = formatData(data)
     
      setPatientArray(formatterArray)

    });
  }, []);

  const handleNameHeader = () => {
    setOrderBirth("")
      if(order === "") {
          setOrder("asc")
          setColumn("name")
      }else if(order === "asc"){
        setOrder("desc")
        setColumn("name")
      }else{
        setOrder("")
        setColumn("")
      }
  }

  const handleBirthDateHeader = () => {
    setOrder("")
    if(orderBirth === "") {
        setOrderBirth("asc")
        setColumn("birthDate")
    }else if(orderBirth === "asc"){
      setOrderBirth("desc")
      setColumn("birthDate")
    }else{
      setOrderBirth("")
      setColumn("")
    }
}

  const renderSortIcon = () => {
    console.log("order renderSortIcon",order);
    if(order === ""){
      return null
    }
    else if(order === "asc"){
      return <FontAwesomeIcon icon={faSortUp} />
    }
    else
    return <FontAwesomeIcon icon={faSortDown} />
  }

  const renderSortIconBirth = () => {
    console.log("order renderSortIcon",order);
    if(orderBirth === ""){
      return null
    }
    else if(orderBirth === "asc"){
      return <FontAwesomeIcon icon={faSortUp} />
    }
    else
    return <FontAwesomeIcon icon={faSortDown} />
  } 

  console.log("order",order);
let sortedArray = [...patientsArray]
  if(order !== "" && column !=="" && column === "name"){
     sortedArray = _.orderBy(sortedArray, [column], [order])
  }else if (orderBirth !== "" && column !=="" && column === "birthDate"){
    sortedArray = _.orderBy(sortedArray, [column], [orderBirth])
  }

  const handleSearch = () => {
    setFirstNameError("")
    setLastNameError("")
    setSearchError("")
    setSuccessResult("")
    
    console.log("firstName, lastName",firstName, lastName);
    let pattern = /^[a-z0-9]+$/i

     let errorBollean = false
    if(firstName!== "" && !firstName.match(pattern)){
      setFirstNameError("Should Only Contain alph-numeric value")
      setSearchData([])
      errorBollean = true
    }

    if(lastName!== "" && !lastName.match(pattern)){
      setLastNameError("Should Only Contain alph-numeric value")
      setSearchData([])
      errorBollean = true
    }

    if(!errorBollean){
      if(firstName !== "" && lastName!== ""){
        let startTime = new Date().getTime();
        Axios.get(`https://try.smilecdr.com/baseR4/Patient?given=${firstName}&family=${lastName}`).then((response) => {
          console.log("response search", response);
          if(!response.data.entry){
            setSearchError(`No data is found with firstName = ${firstName} and lastName = ${lastName}`)
            setSearchData([])
          }else{
            setSuccessResult(`${response.data.entry.length} data is found for firstName = ${firstName} and lastName = ${lastName}`)
            
            setSearchData(response.data.entry)
            let time = new Date().getTime() - startTime
            setResponseTime(time)
          }
        })
      }else if (firstName === "" && lastName!== ""){
        let startTime = new Date().getTime();
        Axios.get(`https://try.smilecdr.com/baseR4/Patient?family=${lastName}`).then((response) => {
          console.log("response By Family search", response);
          if(!response.data.entry){
            setSearchError(`No data is found with lastName = ${lastName}`)
            setSearchData([])
          }else{
            setSuccessResult(`${response.data.entry.length} data is found for lastName = ${lastName}`)
           
            setSearchData(response.data.entry)
            let time = new Date().getTime() - startTime
      setResponseTime(time)
          }
        })
      }else if (firstName !== "" && lastName === ""){
        let startTime = new Date().getTime();
        Axios.get(`https://try.smilecdr.com/baseR4/Patient?given=${firstName}`).then((response) => {
          console.log("response By first search", response);
          if(!response.data.entry){
            setSearchError(`No data is found with firstName = ${firstName} `)
            setSearchData([])
            
          }else{
            setSuccessResult(`${response.data.entry.length} data is found for firstName = ${firstName}`)
            setSearchData(response.data.entry)
            let time = new Date().getTime() - startTime
      setResponseTime(time)
          }
        })
      }else{
          setFirstNameError("Please Enter the First Name")
          setLastNameError("Please Enter the Last Name")
          setSearchData([])
      }
    }
   
    
    
  }

  const handleReset = () => {
    let formatterArray = formatData(SearchData)
     console.log("formatterArray",formatterArray);
      setPatientArray(formatterArray)

  }
  return (
    <div>
      <Row>
      {successResult !== "" && 
                <Alert  variant="success">
                {successResult}
              </Alert>
          }

      {searchError !== "" && 
                <Alert  variant="danger">
                {searchError}
              </Alert>
          }
      </Row>
       <Row>
        <Col>
          <Form.Group>
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter First Name"
              onChange={(event) => setFirstName(event.target.value)}
            />
          </Form.Group>
          {firstNameError !== "" && 
                <Alert  variant="danger">
                {firstNameError}
              </Alert>
          }
        
        </Col>
      
        <Col>
          <Form.Group>
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Last Name"
              onChange={(event) => setLastName(event.target.value)}
            />
             {lastNameError !== "" && 
                <Alert  variant="danger">
                {lastNameError}
              </Alert>
          }
          </Form.Group>
       
        </Col>
        <Col>
        <Button style = {{marginTop: '30px'}} onClick = {handleSearch}>
          Search
        </Button>
        </Col>
        </Row>
        {SearchData.length>0 && 
          <Row>
          <Col style={{textAlign: "center", marginTop:"50px"}}>
          <Button onClick={handleReset}>
            Reset the Search Result to Table
          </Button>
          </Col>
        </Row>
        }
        
        <Table striped bordered hover responsive style={{marginTop: '50px'}}>
          <thead>
            <tr>
              <th onClick = {handleNameHeader} className="clickable">Name {renderSortIcon()}</th>
              <th onClick = {handleBirthDateHeader} className="clickable">Birth Date {renderSortIconBirth()}</th>
              <th>Street</th>
              <th>City</th>
              <th>District</th>
              <th>State</th>
              <th>Country</th>
              <th>Postal Code</th>
              <th>Gender</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
           {
             sortedArray.map((item) => (
               <tr>
                 <td>{item.name}</td>
                 <td>{item.birthDate}</td>
                 <td>{item.street}</td>
                 <td>{item.city}</td>
                 <td>{item.district}</td>
                 <td>{item.state}</td>
                 <td>{item.country}</td>
                 <td>{item.postalCode}</td>
                 <td>{item.gender}</td>
                 <td>{item.phoneNumber}</td>
                 </tr>
             ))
           }
          </tbody>
        </Table>
        <Row>
        <Col>
        <Alert  variant="primary" style={{textAlign:"center"}}>
            Response Time = {responseTime} ms 
        </Alert>
        </Col>
        </Row>
        
    </div>
  );
}

export default App;
