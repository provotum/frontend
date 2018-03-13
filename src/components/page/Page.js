import React from 'react';
import {Layout, Menu} from 'antd';
import {BrowserRouter as Router, Link, Route} from 'react-router-dom';
import DashboardPage from "../dashboard/DashboardPage";

const {Header, Content, Footer} = Layout;
const logo = require('../../../img/pv-logo-frontendwh1024.png');

class Page extends React.Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <Router>
        <Layout className="layout">
          <Header>
            <div className="logo"/>
            <nav>
              <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={["/"]}
                style={{lineHeight: '64px'}}>
                <Menu.Item><img src={logo} height={60}/></Menu.Item>
              </Menu>
            </nav>
          </Header>
          <Content style={{padding: '0 50px'}}>
            <div style={{background: '#fff', padding: 24, minHeight: 280}}>
              <Route exact path="/" component={DashboardPage}/>
            </div>

          </Content>
          <Footer style={{textAlign: 'center'}}>
            created in Zurich with ♥ by Provotum
          </Footer>
        </Layout>
      </Router>
    );
  }
}


export default Page;
