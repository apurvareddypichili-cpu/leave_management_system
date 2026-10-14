
const express = require("express");
const mysql = require("mysql8");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Appu@2006!",
    database: "leave_management_db"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed: " + err.message);
        return;
    }

    console.log("MySQL Database Connected Successfully!");
});

// 1. GET ALL LEAVE RECORDS
app.get("/leaves", (req, res) => {
    const sql = "SELECT * FROM leave_management";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        res.json(result);
    });
});

// 2. GET ONE LEAVE RECORD
app.get("/leaves/:employee_id", (req, res) => {
    const employeeId = req.params.employee_id;

    const sql =
        "SELECT * FROM leave_management WHERE EMPLOYEE_ID = ?";

    db.query(sql, [employeeId], (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        res.json(result);
    });
});

// 3. INSERT A NEW LEAVE RECORD
app.post("/leaves", (req, res) => {
    const {
        employee_id,
        name,
        department,
        type_of_leave,
        number_of_days,
        description
    } = req.body;

    if (
        !employee_id ||
        !name ||
        !department ||
        !type_of_leave ||
        number_of_days === undefined ||
        number_of_days === "" ||
        !description
    ) {
        return res.status(400).send("Please fill in all fields.");
    }

    const days = Number(number_of_days);

    if (!Number.isInteger(days) || days <= 0) {
        return res.status(400).send(
            "Number of days must be a positive whole number."
        );
    }

    const sql = `
        INSERT INTO leave_management
        (EMPLOYEE_ID, NAME, DEPARTMENT, TYPE_OF_LEAVE,
         NUMBER_OF_DAYS, DESCRIPTION)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        employee_id,
        name,
        department,
        type_of_leave,
        days,
        description
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        res.status(201).send("Leave record inserted successfully!");
    });
});

// 4. UPDATE A LEAVE RECORD
app.put("/leaves/:employee_id", (req, res) => {
    const employeeId = req.params.employee_id;

    const {
        name,
        department,
        type_of_leave,
        number_of_days,
        description
    } = req.body;

    if (
        !name ||
        !department ||
        !type_of_leave ||
        number_of_days === undefined ||
        number_of_days === "" ||
        !description
    ) {
        return res.status(400).send("Please fill in all fields.");
    }

    const days = Number(number_of_days);

    if (!Number.isInteger(days) || days <= 0) {
        return res.status(400).send(
            "Number of days must be a positive whole number."
        );
    }

    const sql = `
        UPDATE leave_management
        SET NAME = ?,
            DEPARTMENT = ?,
            TYPE_OF_LEAVE = ?,
            NUMBER_OF_DAYS = ?,
            DESCRIPTION = ?
        WHERE EMPLOYEE_ID = ?
    `;

    const values = [
        name,
        department,
        type_of_leave,
        days,
        description,
        employeeId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Employee record not found.");
        }

        res.send("Leave record updated successfully!");
    });
});

// 5. DELETE A LEAVE RECORD
app.delete("/leaves/:employee_id", (req, res) => {
    const employeeId = req.params.employee_id;

    const sql =
        "DELETE FROM leave_management WHERE EMPLOYEE_ID = ?";

    db.query(sql, [employeeId], (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Employee record not found.");
        }

        res.send("Leave record deleted successfully!");
    });
});

// Start Server
app.listen(3000, () => {
    console.log(
        "Leave Management System running at http://localhost:3000"
    );
});