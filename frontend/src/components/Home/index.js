import React from "react";
import "./index.scss";

export default function Index() {
    return (
        <div className="homePage">
            <div className="homePageTitle">Welcome to Key Stroke</div>
            <br />
            <div className="homePageText">
                Dear user, This test is being conducted to collect keystroke data. Please ensure that you complete
                the test in a single session.
            </div>
            <br />
            <div className="homePageText">
                Go to train/test for us to take your data and train. Using this we will be able to identify in the test.
            </div>
            <div className="homePageText">
                If you have a csv file you can upload in train/test upload. You can view you uploads in result page.
            </div>
            <br />
            <div className="homePageText">
                If you want to take a test go to take test
            </div>
        </div>
    );
}