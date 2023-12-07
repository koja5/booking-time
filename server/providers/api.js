require("dotenv").config();
const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const expiresToken = "12h";
const logger = require("./config/logger");
const request = require("request");
const fs = require("fs");
const sha1 = require("sha1");
const stripe = require("stripe")(process.env.stripe_key);

module.exports = router;

var connection = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

connection.getConnection(function (err, conn) {
  console.log(err);
  console.log(conn);
});

/* GET api listing. */
router.get("/", (req, res) => {
  // res.send("api works");
});

router.get("/checkReservedAppointments/:storeId", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select * from tasks t where CAST(t.start as DATE) >= CAST(CURRENT_TIMESTAMP AS DATE) and storeId = ? order by CAST(t.start AS DATE) asc",
          [req.params.storeId],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get("/checkUser/:value", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select * from customers where email = ? or mobile = ? or telephone = ?",
          [req.params.value, req.params.value, req.params.value],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/pay", (req, res, next) => {
  // stripe.charges.create(
  //   {
  //     amount: req.body.price * 100,
  //     currency: "EUR",
  //     description: req.body.description,
  //     source: req.body.token.id,
  //   },
  //   (err, charge) => {
  //     if (err) {
  //       res.json(false);
  //     } else {
  //       res.json(true);
  //     }
  //   }
  // );

  stripe.paymentIntents.create(
    {
      amount: req.body.price * 100,
      currency: "EUR",
      description: req.body.description,
      automatic_payment_methods: { enabled: true },
      application_fee_amount: req.body.price * 100 * 0.01,
      confirm: true,
      payment_method: "pm_card_visa",
      return_url: "https://google.com",
    },
    {
      stripeAccount: req.body.stripeId,
    },
    (err, charge) => {
      if (err) {
        res.json(false);
      } else {
        res.json(true);
      }
    }
  );
});

router.get("/getStripeId/:superadmin", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select stripe_id from users_superadmin where sha1(id) = ?",
          [req.params.superadmin],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get("/getLocations/:superadmin", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select * from store where allowed_online = 1 and sha1(superadmin) = ?",
          [req.params.superadmin],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get("/getAllTerminsForStore/:storeId", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select * from store s join users u on s.id = u.storeId join worktimes w on u.id = w.user_id where s.id = ? and u.allowed_online = 1 order by w.validate_from asc",
          [req.params.storeId],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get("/getHolidaysForClinic/:id", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select * from store_holidayTemplate sh join holidays h on sh.templateId = h.templateId where (sha1(h.superAdminId) = ? or sha1(sh.superadminId) = ?) and CAST(h.StartTime as DATE) >= CAST(CURRENT_TIMESTAMP AS DATE)",
          [req.params.id, req.params.id],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get(
  "/checkTermineStillAvailable/:reservationTime/:store/:userId",
  async (req, res, next) => {
    try {
      connection.getConnection(function (err, conn) {
        if (err) {
          logger.log("error", err.sql + ". " + err.sqlMessage);
          res.json(err);
        } else {
          conn.query(
            "select * from tasks where start like ? and storeId = ? and creator_id = ?",
            [req.params.reservationTime, req.params.store, req.params.userId],
            function (err, rows, fields) {
              conn.release();
              if (err) {
                logger.log("error", err.sql + ". " + err.sqlMessage);
                res.json(err);
              } else {
                res.json(rows);
              }
            }
          );
        }
      });
    } catch (ex) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(ex);
    }
  }
);

router.post("/createAppointment", function (req, res) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var data = {
      creator_id: req.body.calendar.user_id,
      customer_id: req.body.personal.id,
      title: req.body.personal.lastname + " " + req.body.personal.firstname,
      colorTask: 12,
      start: req.body.calendar.date,
      end: req.body.calendar.end,
      telephone: req.body.personal.phone,
      therapy_id: 0,
      superadmin: 4,
      confirm: 1,
      online: 1,
      paid: req.body.calendar.token ? req.body.calendar.token.created : 0,
      amount: req.body.calendar.amount,
    };
    if (req.body.calendar.location.id !== undefined) {
      data["storeId"] = req.body.calendar.location.id;
    }
    conn.query("insert into tasks SET ?", data, function (err, rows) {
      conn.release();
      if (!err) {
        res.json(true);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(false);
      }
    });
  });
});

router.post("/createPatient", function (req, res) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    req.body.mobile = copyValue(req.body.phone);
    delete req.body.phone;
    (req.body.shortname = req.body.lastname + " " + req.body.firstname),
      (req.body.password = sha1(generateRandomPassword()));

    conn.query("insert into customers SET ?", [req.body], function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows.insertId);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(false);
      }
    });
  });
});

router.get("/getBookingSettings/:superadminId", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select * from booking_settings where sha1(superadmin_id) = ?",
          [req.params.superadminId],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

function generateRandomPassword() {
  return Math.random().toString(36).slice(-8);
}

function copyValue(value) {
  return JSON.parse(JSON.stringify(value));
}
