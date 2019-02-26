import React from 'react';
import { Route, Switch } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UserPage from './pages/UserPage';
import MapsPage from './pages/MapsPage';
import NotFoundPage from './pages/NotFoundPage';
import ReportPage from './pages/ReportPage';
import AttendancePage from './pages/AttendancePage';
import Golang from './pages/Golang';
import RegistrationCourse from './pages/RegistrationCourse';
import Java from './pages/Java';
import CSharp from './pages/CSharp';
import Login from './pages/Login';

class Routes extends React.Component {
  render() {
    return (
      <Switch>
        <Route path='/' exact component={DashboardPage} />
        <Route path='/dashboard' component={DashboardPage} />
        <Route path='/profile' component={ProfilePage} />
        <Route path='/tables' component={() => <UserPage dataLogin = {this.props.dataLogin}></UserPage>} />
        <Route path='/maps' component={MapsPage} />
        <Route path='/attendance' component={AttendancePage} />
        <Route path='/course/golang' component={Golang} />
        <Route path='/course/java' component={Java} />
        <Route path='/course/csharp' component={CSharp} />
        <Route path='/regiscourse' component={RegistrationCourse} />
        <Route path='/report' component={ReportPage} />
        <Route path='/404' component={Login} />
      </Switch>
    );
  }
}

export default Routes;
