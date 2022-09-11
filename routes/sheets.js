const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const { ensureAuth } = require("../middleware/auth");

const PATH = process.env.KEY_FILE_PATH;

let googleSheets;
let spreadsheetId = process.env.SHEET_ID;
let auth;

const initSheets = async () => {
  try {
    auth = new google.auth.GoogleAuth({
      keyFile: PATH,
      scopes: "https://www.googleapis.com/auth/spreadsheets", //complete access to read and write sheets
    });
    const client = await auth.getClient();
    googleSheets = google.sheets({ version: "v4", auth: client });

    console.log("Sheetssss");
  } catch (err) {
    console.log(err);
  }
};

initSheets();

const getSheetRows = async (req, res) => {
  try {
    console.log("req.params", req.params);
    spreadsheetId = req.params.spreadsheet_id || process.env.SHEET_ID;

    const getRows = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A1",
    });
    const data = getRows.data.values;
    //   console.log("METADATA", JSON.stringify(data, null, 2));
    console.log("COL1,  COL2,  COL3");

    if (data.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Data not found!!" });
    }

    for (const row of data) {
      console.log(row.join(", "));
    }
    res.status(200).json({ success: true, data: getRows.data.values });
  } catch (err) {
    console.log("error", err);
    return res.status(409).json({ success: false });
  }
};

const updateCell = async (req, res) => {
  try {
    let { spreadsheet_id, sheet_id, row_number, column_number, value } =
      req.body;

    if (!spreadsheet_id || !sheet_id || !row_number || !column_number || !value)
      return res
        .status(409)
        .json({ success: false, error: "Please pass all the required fields" });

    const coloumnNameToNumberMapping = {
      1: "A",
      2: "B",
      3: "C",
    };
    console.log(
      "range",
      `Sheet1!${coloumnNameToNumberMapping[column_number]}${row_number}`
    );

    const request = {
      spreadsheetId: spreadsheetId,
      range: `Sheet1!${coloumnNameToNumberMapping[column_number]}${row_number}`,
      valueInputOption: "USER_ENTERED",
      resource: { values: [[value]] },
    };

    const resp = await googleSheets.spreadsheets.values.update(request);

    console.log(JSON.stringify("resp", resp.data));

    return res.status(200).json({ success: true, message: "updated!!" });
  } catch (error) {
    console.log(error);
    return res
      .status(409)
      .json({ success: false, message: "something went wrong!" });
  }
};

router.post("/spreadsheet/update", ensureAuth, updateCell);
router.get("/spreadsheet/:sheetId", ensureAuth, getSheetRows);

module.exports = router;
