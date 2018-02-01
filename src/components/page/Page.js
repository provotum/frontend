import React from 'react';
import {Layout, Menu} from 'antd';
import {BrowserRouter as Router, Link, Route} from 'react-router-dom';
import DashboardPage from "../dashboard/DashboardPage";

const {Header, Content, Footer} = Layout;

class Page extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      pages: [
        {
          route: "/dashboard",
          name: "Dashboard",
          component: DashboardPage
        }
      ]
    };

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
                defaultSelectedKeys={[this.state.pages[0].route]}
                style={{lineHeight: '64px'}}>
                {/* Render all available pages */}
                {this.state.pages.map(page =>
                  <Menu.Item key={page.route}><Link to={page.route}>{page.name}</Link></Menu.Item>
                )}
              </Menu>
            </nav>
          </Header>
          <Content style={{padding: '0 50px'}}>
            <div style={{background: '#fff', padding: 24, minHeight: 280}}>
              <Route exact path="/" component={DashboardPage}/>
              {this.state.pages.map(page =>
                <Route key={page.route} path={page.route} component={page.component}/>
              )}
            </div>

          </Content>
          <Footer style={{textAlign: 'center'}}>
            Provotum | Voting Dashboard | Design ©2018 Created by Provotum
          </Footer>
        </Layout>
      </Router>
    );
  }
}


export default Page;
