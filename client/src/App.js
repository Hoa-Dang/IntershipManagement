import React, { Component } from 'react';
import Routes from '../src/components/Routes';
import TopNavigation from './components/topNavigation';
import SideNavigation from './components/sideNavigation';
import Footer from './components/Footer';
import './index.css';
import Login from './components/pages/Login';

class App extends Component {
  constructor(){
    super();
    this.state = {
      isLogin : false,
      dataLogin : ""
    }
  }

  onLogin (value) {
    if (value !== null) {
      this.setState({isLogin : value});
    }
    
  }

  changeComponent () {
    if (this.state.isLogin === false) {
      return (
      <div className="flexible-content">
      <main id="content" className="p-5">
      <Login onLogin = {this.onLogin.bind(this)}></Login>
      </main>
      </div>
      )
    } else {
      return (
        <div className="flexible-content">
          <TopNavigation />
          <SideNavigation />
          <main id="content" className="p-5">
            <Routes ></Routes>
          </main>
          <Footer />
        </div>
      )
    }
  }

  render() {
    let component = this.changeComponent();
    return (
      <div>
          {/* <div className="flexible-content">
          <TopNavigation />
          <SideNavigation />
          <main id="content" className="p-5">
            <Routes ></Routes>
          </main>
          <Footer />
        </div> */}
        {component}
      </div>
    );
  }
}

export default App;
