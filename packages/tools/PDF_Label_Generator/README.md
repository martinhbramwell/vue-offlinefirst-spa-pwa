# PDF generator

This project has artifacts from [Express.js with Babel Boilerplate](https://github.com/vmasto/express-babel) but uses very little of it.  The main reason was to be able to to create a Express app that uses es2016 syntax. Ultimately, there was no need to generate PDFs to the client, so it scarcely even uses Express and handles everything in the server.

** It will only work on Unix based machines.**

## Usage

In the same directory as this README, execute these commands:

    mkdir /tmp/iriblu_bottleLabels;
    cp tools/envases.csv /tmp/iriblu_bottleLabels;
    npm install;
    npm run dev;


Copy the file `./tools/envases.csv` to `/tmp/iriblu_bottleLabels`  That file contains a short list of fake label codes for testing purposes. See below for the steps to create a real one.

Start a browser on the same machine and connect to the app with the URL http://localhost:8888/lbl

On successful completion the browser will show:

"Process complete. Files were written to :: /tmp/iriblu_bottleLabels/IridiumBlueBottleLabels"

## Generating a file of label codes

Copy the file `./tools/BottleCodesGenerator.sql` to the MySql database server. On the server, in the directory containing `BottleCodesGenerator.sql` run the command:

    mysql -u root -p ib2018 < BottleCodesGenerator.sql

Examine the resulting comma-separated-values file (csv) with:

    less /tmp/envases.csv; //  Type q to exit from "less"

