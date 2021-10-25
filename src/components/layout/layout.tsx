import React, { Component } from "react";
import './layout.css';
import { Switch, Route, BrowserRouter, Redirect } from "react-router-dom";
import PickName from '../pickname/pickname'
import Chat from '../main/main'
import Header from '../header/header'
import Menu from '../menu/menu'

export default class Layout extends Component {

    isAsideVisible = () => {

        if (window.innerWidth <= 600) {


        } 

        else if (window.innerWidth > 600) {


        }

    }

    componentDidMount() {
        
        window.addEventListener('resize', this.isAsideVisible, true);

        if (window.innerWidth <= 600) {

            this.setState({

                asideRevealed: false

            });

        }

    }

    componentWillUnmount() {

        window.removeEventListener('resize', this.isAsideVisible, true);

    }

    render() {

        return(
            <BrowserRouter>
                <section className="layout">

                    <aside>
                        <Menu/>
                    </aside>

                    <main>

                        <Header />

                        <Switch>
                            <Route path="/" component={PickName} exact />
                            <Route path="/chat" component={Chat} exact />
                            <Redirect from="/*" to="/" exact />
                        </Switch>
                    </main>

                </section>

            </BrowserRouter>
        )

    }

}