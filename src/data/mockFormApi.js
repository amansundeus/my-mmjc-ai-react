import { useState, useCallback, useEffect } from "react";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MOCK API  â€“ replace with real fetch calls
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOCK_RESPONSE = {
  message: "Fetched attribute definitions successfully",
  body: {
    filingTypeId: 200,
    filingTypeName: "AOC-4",
    formId: 1,
    percentComplete: 0,
    sections: [

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // 1. BASIC DETAILS
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      {
        sectionId: "basic_details",
        sectionTitle: "Basic details",
        theme: "blue",
        fields: [
          { attributeId: 2001, fieldId: "financial_year_from", label: "Financial year From", type: "date", format: "DD/MM/YYYY", required: true, gridColumn: 1, defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2002, fieldId: "financial_year_to", label: "Financial year To", type: "date", format: "DD/MM/YYYY", required: true, gridColumn: 2, defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2003, fieldId: "date_board_meeting_fin_approved", label: "Date of Board of directors\' meeting in which financial statements are approved", type: "date", format: "DD/MM/YYYY", required: true, gridColumn: 3, defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2004, fieldId: "date_adjourned_agm", label: "Date of adjourned AGM in which financial statements were adopted", type: "date", format: "DD/MM/YYYY", required: true, gridColumn: 4, defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2005, fieldId: "director_signed_fin_name", label: "Details of director(s), manager, secretary, CEO, CFO, IRP, RP or Liquidator who have signed the financial statements Name", type: "text", placeholder: "Lorem ipsum", required: true, gridColumn: 1, defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2006, fieldId: "date_board_meeting_boards_report", label: "Date of Board of directors\' meeting in which boards\' report referred under section 134 was approved", type: "date", format: "DD/MM/YYYY", required: true, gridColumn: 2, defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2007, fieldId: "director_signed_boards_report_name", label: "Details of director(s), IRP, RP, Liquidator who have signed the Boards\' report Name", type: "text", placeholder: "Lorem ipsum", required: true, gridColumn: 3, defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2008, fieldId: "date_of_agm", label: "Date of AGM", type: "date", format: "DD/MM/YYYY", required: true, gridColumn: 4, defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2009, fieldId: "is_subsidiary_company", label: "Whether the company is a subsidiary company?", type: "radio", required: true, gridColumn: 1, defaultValue: "yes", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], conditionalOn: null, highlight: null, value: null },
          { attributeId: 2010, fieldId: "holding_company_name", label: "Name of the holding company", type: "text", placeholder: "Lorem ipsum", required: true, gridColumn: 2, defaultValue: null, options: null, conditionalOn: { fieldId: "is_subsidiary_company", value: "yes" }, highlight: null, value: null },
          { attributeId: 2011, fieldId: "has_subsidiary_company", label: "Whether the company has a subsidiary company?", type: "radio", required: true, gridColumn: 3, defaultValue: "yes", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], conditionalOn: null, highlight: null, value: null },
          { attributeId: 2012, fieldId: "number_of_auditors", label: "Number of Auditors", type: "number", required: true, gridColumn: 1, defaultValue: "2", options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2013, fieldId: "member_name", label: "Name of partner / proprietor signing financials", type: "text", placeholder: "Lorem ipsum", required: true, gridColumn: 2, defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
        ],
        subsections: null, tables: null, dynamicGroups: null, additionalFields: null,
      },

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // 2. BOOKS OF ACCOUNTS IN ELECTRONIC MODE
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      {
        sectionId: "books_of_accounts_electronic",
        sectionTitle: "Books of accounts in electronic mode",
        theme: "yellow",
        fields: null,
        subsections: [
          {
            subsectionId: "postal_address_servers",
            subsectionTitle: "Postal Address of the Place of maintenance of computer servers (Storing Accounting and data)",
            fields: [
              { attributeId: 2103, fieldId: "address_line_1", label: "Address Line 1", type: "text", required: false, gridColumn: 1, placeholder: "Lorem ipsum", defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2104, fieldId: "address_line_2", label: "Address Line 2", type: "text", required: false, gridColumn: 2, placeholder: "Lorem ipsum", defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2105, fieldId: "country", label: "Country", type: "text", required: false, gridColumn: 3, placeholder: "Lorem ipsum", defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2106, fieldId: "state", label: "State", type: "text", required: false, gridColumn: 4, placeholder: "Lorem ipsum", defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2107, fieldId: "city", label: "City", type: "text", required: false, gridColumn: 1, placeholder: "Lorem ipsum", defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2108, fieldId: "pin_zip_code", label: "Pin/Zip code", type: "text", required: false, gridColumn: 2, placeholder: "Lorem ipsum", defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2109, fieldId: "name_of_service_provider", label: "Name of the service provider", type: "text", required: false, gridColumn: 1, placeholder: "Lorem ipsum", defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2110, fieldId: "internet_protocol_address", label: "Internet protocol address of service provider", type: "text", required: false, gridColumn: 2, placeholder: "Lorem ipsum", defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2111, fieldId: "location_of_service_provider", label: "Location of the service provider", type: "select", required: false, gridColumn: 3, placeholder: "Lorem ipsum", defaultValue: null, options: [{ value: "india", label: "India" }, { value: "outside_india", label: "Outside India" }], conditionalOn: null, highlight: null, value: null },
              { attributeId: 2101, fieldId: "books_on_cloud", label: "Whether books of account and other books and papers are maintained on cloud ?", type: "radio", required: true, gridColumn: 1, defaultValue: "yes", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], conditionalOn: null, highlight: null, value: null },
              { attributeId: 2102, fieldId: "cloud_address", label: "If books of accounts are maintained on cloud, then address as provided by the service provider", type: "text", required: true, gridColumn: 2, placeholder: "Lorem ipsum", defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2112, fieldId: "outside_india_person_address", label: "If location of service provider is outside India, name and address of the person in control of the books of account and other books and papers in India", type: "text", required: true, gridColumn: 3, placeholder: "Lorem ipsum", defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
            ],
            tables: null, additionalFields: null,
          },
        ],
        tables: null, dynamicGroups: null, additionalFields: null,
      },

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // 3. BALANCE SHEET  (all sub-sections nested inside)
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      {
        sectionId: "balance_sheet",
        sectionTitle: "Balance sheet",
        theme: "purple",
        fields: [
          { attributeId: 2201, fieldId: "paid_up_share_capital", label: "Paid up Share Capital", type: "currency", prefix: "Rs.", required: true, gridColumn: 1, defaultValue: "20", options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2202, fieldId: "share_application_money", label: "Share application money received and outstanding", type: "currency", prefix: "Rs.", required: true, gridColumn: 2, defaultValue: "20", options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2203, fieldId: "paid_up_foreign_company", label: "Paid up capital held by foreign company", type: "currency", prefix: "Rs.", required: true, gridColumn: 3, defaultValue: "20", options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2204, fieldId: "paid_up_foreign_holding", label: "Paid up capital held by foreign holding and/ or through its subsidiaries", type: "currency", prefix: "Rs.", required: true, gridColumn: 4, defaultValue: "20", options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2205, fieldId: "shares_bought_back", label: "Number of shares bought back during the reporting period", type: "number", required: true, gridColumn: 1, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2206, fieldId: "forfeited_shares", label: "Forfeited shares", type: "number", required: true, gridColumn: 2, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2207, fieldId: "forfeited_shares_reissued", label: "Forfeited shares re-issued", type: "number", required: true, gridColumn: 3, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2208, fieldId: "warrants_to_equity_conversion", label: "Conversion of warrants into equity shares during the reporting period", type: "number", required: true, gridColumn: 4, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2209, fieldId: "warrants_to_preference_conversion", label: "Conversion of warrants into preference shares during the reporting period", type: "number", required: true, gridColumn: 1, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 2210, fieldId: "warrants_issued_reporting_period", label: "Warrants issued during the reporting period", type: "number", required: true, gridColumn: 2, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
        ],
        tables: [
          {
            tableId: "shareholders_more_than_5_percent",
            tableTitle: "Details of shareholders holding more than 5%",
            type: "static_table",
            columns: [
              { columnId: "equity_shareholder_name", header: "Name of equity shareholder", type: "text", prefix: null, subColumns: null },
              { columnId: "percentage_held", header: "% of shareholding of entire equity capital", type: "number", prefix: null, subColumns: null },
            ],
            rows: [
              { fieldId: "shareholder_row_1", fieldTitle: "Shareholder 1", required: true, highlight: null, cells: [{ attributeId: 2301, columnKey: "equity_shareholder_name", value: null }, { attributeId: 2302, columnKey: "percentage_held", value: null }] },
              { fieldId: "shareholder_row_2", fieldTitle: "Shareholder 2", required: true, highlight: null, cells: [{ attributeId: 2303, columnKey: "equity_shareholder_name", value: null }, { attributeId: 2304, columnKey: "percentage_held", value: null }] },
            ],
          },
        ],
        subsections: [
          // â”€â”€ Reserves and Surplus â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            subsectionId: "reserves_and_surplus",
            subsectionTitle: "Reserves and Surplus",
            fields: [
              { attributeId: 2501, fieldId: "capital_redemption_reserve", label: "Capital Redemption Reserve", type: "currency", prefix: "Rs.", required: true, gridColumn: 1, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2502, fieldId: "capital_reserve", label: "Capital Reserve", type: "currency", prefix: "Rs.", required: true, gridColumn: 2, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2503, fieldId: "debenture_redemption_reserve", label: "Debenture Redemption Reserve", type: "currency", prefix: "Rs.", required: true, gridColumn: 3, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2504, fieldId: "revaluation_reserve", label: "Revaluation Reserve", type: "currency", prefix: "Rs.", required: true, gridColumn: 4, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2505, fieldId: "general_reserve", label: "General Reserve", type: "currency", prefix: "Rs.", required: true, gridColumn: 1, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2506, fieldId: "statutory_reserve", label: "Statutory Reserve", type: "currency", prefix: "Rs.", required: true, gridColumn: 2, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2507, fieldId: "securities_premium", label: "Securities Premium", type: "currency", prefix: "Rs.", required: true, gridColumn: 3, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2508, fieldId: "dividend_equalisation_reserve", label: "Dividend Equalisation Reserve", type: "currency", prefix: "Rs.", required: true, gridColumn: 4, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2509, fieldId: "other_reserve_from_profits", label: "Any other reserve created out of profits", type: "currency", prefix: "Rs.", required: true, gridColumn: 1, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 2510, fieldId: "accumulated_profits_losses", label: "Accumulated profits / losses", type: "currency", prefix: "Rs.", required: true, gridColumn: 2, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
            ],
            tables: [
              {
                tableId: "items_reduced_reserves_surplus",
                tableTitle: null,
                type: "multi_column_table",
                columns: [
                  { columnId: "field_title", header: "Items to be reduced from Reserves and Surplus", type: "label", prefix: null, subColumns: null },
                  { columnId: "other_current_assets", header: "Other current assets", type: "currency", prefix: "Rs.", subColumns: null },
                  { columnId: "other_non_current_assets", header: "Other non-current assets", type: "currency", prefix: "Rs.", subColumns: null },
                ],
                rows: [
                  { fieldId: "deferred_expenditure", fieldTitle: "Deferred expenditure", required: true, highlight: null, cells: [{ attributeId: 2511, columnKey: "field_title", value: "Deferred expenditure" }, { attributeId: 2512, columnKey: "other_current_assets", value: null }, { attributeId: 2513, columnKey: "other_non_current_assets", value: null }] },
                  { fieldId: "misc_expenditure", fieldTitle: "Miscellaneous expenditure not written off", required: true, highlight: null, cells: [{ attributeId: 2514, columnKey: "field_title", value: "Miscellaneous expenditure not written off" }, { attributeId: 2515, columnKey: "other_current_assets", value: null }, { attributeId: 2516, columnKey: "other_non_current_assets", value: null }] },
                  { fieldId: "preliminary_expenditure", fieldTitle: "Preliminary expenditure not written off", required: true, highlight: null, cells: [{ attributeId: 2517, columnKey: "field_title", value: "Preliminary expenditure not written off" }, { attributeId: 2518, columnKey: "other_current_assets", value: null }, { attributeId: 2519, columnKey: "other_non_current_assets", value: null }] },
                  { fieldId: "pre_incorporation_expenditure", fieldTitle: "Pre-incorporation expenditure not written off", required: true, highlight: null, cells: [{ attributeId: 2520, columnKey: "field_title", value: "Pre-incorporation expenditure not written off" }, { attributeId: 2521, columnKey: "other_current_assets", value: null }, { attributeId: 2522, columnKey: "other_non_current_assets", value: null }] },
                ],
              },
            ],
            additionalFields: [
              { attributeId: 2523, fieldId: "net_worth", label: "Net worth", type: "currency", prefix: "Rs.", required: true, gridColumn: 1, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
            ],
          },
          // â”€â”€ Borrowings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            subsectionId: "borrowings",
            subsectionTitle: "Borrowings",
            fields: null,
            tables: [
              {
                tableId: "borrowings_table",
                tableTitle: null,
                type: "multi_column_table",
                columns: [
                  { columnId: "field_title", header: "Field title", type: "label", prefix: null, subColumns: null },
                  { columnId: "secured_borrowing", header: "Secured borrowing", type: null, prefix: null, subColumns: [{ columnId: "secured_long_term", header: "Long term borrowing", type: "number" }, { columnId: "secured_short_term", header: "Short term borrowing", type: "number" }] },
                  { columnId: "unsecured_borrowing", header: "Unsecured borrowing", type: null, prefix: null, subColumns: [{ columnId: "unsecured_long_term", header: "Long term borrowing", type: "number" }, { columnId: "unsecured_short_term", header: "Short term borrowing", type: "number" }] },
                ],
                rows: [
                  { fieldId: "deb_bodies_corp", fieldTitle: "Debentures: from bodies corporate", required: true, highlight: null, cells: [{ attributeId: 2701, columnKey: "field_title", value: "Debentures: from bodies corporate" }, { attributeId: 2702, columnKey: "secured_long_term", value: null }, { attributeId: 2703, columnKey: "secured_short_term", value: null }, { attributeId: 2704, columnKey: "unsecured_long_term", value: null }, { attributeId: 2705, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "deb_other_bodies", fieldTitle: "Debentures: from other than bodies corporate", required: true, highlight: null, cells: [{ attributeId: 2706, columnKey: "field_title", value: "Debentures: from other than bodies corporate" }, { attributeId: 2707, columnKey: "secured_long_term", value: null }, { attributeId: 2708, columnKey: "secured_short_term", value: null }, { attributeId: 2709, columnKey: "unsecured_long_term", value: null }, { attributeId: 2710, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "bonds_bodies_corp", fieldTitle: "Bonds: from bodies corporate", required: true, highlight: null, cells: [{ attributeId: 2711, columnKey: "field_title", value: "Bonds: from bodies corporate" }, { attributeId: 2712, columnKey: "secured_long_term", value: null }, { attributeId: 2713, columnKey: "secured_short_term", value: null }, { attributeId: 2714, columnKey: "unsecured_long_term", value: null }, { attributeId: 2715, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "bonds_other_bodies", fieldTitle: "Bonds: from other than bodies corporate", required: false, highlight: null, cells: [{ attributeId: 2716, columnKey: "field_title", value: "Bonds: from other than bodies corporate" }, { attributeId: 2717, columnKey: "secured_long_term", value: null }, { attributeId: 2718, columnKey: "secured_short_term", value: null }, { attributeId: 2719, columnKey: "unsecured_long_term", value: null }, { attributeId: 2720, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "term_loans_banks", fieldTitle: "Term loans from Banks", required: true, highlight: null, cells: [{ attributeId: 2721, columnKey: "field_title", value: "Term loans from Banks" }, { attributeId: 2722, columnKey: "secured_long_term", value: null }, { attributeId: 2723, columnKey: "secured_short_term", value: null }, { attributeId: 2724, columnKey: "unsecured_long_term", value: null }, { attributeId: 2725, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "any_facilities_banks", fieldTitle: "Any other kind of facilities / Loan repayable on demand: from Banks", required: true, highlight: null, cells: [{ attributeId: 2726, columnKey: "field_title", value: "Any other kind of facilities / Loan repayable on demand: from Banks" }, { attributeId: 2727, columnKey: "secured_long_term", value: null }, { attributeId: 2728, columnKey: "secured_short_term", value: null }, { attributeId: 2729, columnKey: "unsecured_long_term", value: null }, { attributeId: 2730, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "term_loans_pfi", fieldTitle: "Term loans from Public financial institutions", required: true, highlight: null, cells: [{ attributeId: 2731, columnKey: "field_title", value: "Term loans from Public financial institutions" }, { attributeId: 2732, columnKey: "secured_long_term", value: null }, { attributeId: 2733, columnKey: "secured_short_term", value: null }, { attributeId: 2734, columnKey: "unsecured_long_term", value: null }, { attributeId: 2735, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "any_facilities_pfi", fieldTitle: "Any other kind of facilities / Loan repayable on demand: from Public financial institutions", required: true, highlight: null, cells: [{ attributeId: 2736, columnKey: "field_title", value: "Any other kind of facilities / Loan repayable on demand: from Public financial institutions" }, { attributeId: 2737, columnKey: "secured_long_term", value: null }, { attributeId: 2738, columnKey: "secured_short_term", value: null }, { attributeId: 2739, columnKey: "unsecured_long_term", value: null }, { attributeId: 2740, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "term_loan_other_fi", fieldTitle: "Term Loan from Other Financial institutions (other than banks, PFI) like NBFCs etc", required: true, highlight: null, cells: [{ attributeId: 2741, columnKey: "field_title", value: "Term Loan from Other Financial institutions (other than banks, PFI) like NBFCs etc" }, { attributeId: 2742, columnKey: "secured_long_term", value: null }, { attributeId: 2743, columnKey: "secured_short_term", value: null }, { attributeId: 2744, columnKey: "unsecured_long_term", value: null }, { attributeId: 2745, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "any_facilities_other_fi", fieldTitle: "Any other kind of facilities / Loan repayable on demand: from Other FI (other than banks, PFI) like NBFCs etc", required: true, highlight: null, cells: [{ attributeId: 2746, columnKey: "field_title", value: "Any other kind of facilities / Loan repayable on demand: from Other FI (other than banks, PFI) like NBFCs etc" }, { attributeId: 2747, columnKey: "secured_long_term", value: null }, { attributeId: 2748, columnKey: "secured_short_term", value: null }, { attributeId: 2749, columnKey: "unsecured_long_term", value: null }, { attributeId: 2750, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "public_deposits", fieldTitle: "Public deposits", required: true, highlight: null, cells: [{ attributeId: 2751, columnKey: "field_title", value: "Public deposits" }, { attributeId: 2752, columnKey: "secured_long_term", value: null }, { attributeId: 2753, columnKey: "secured_short_term", value: null }, { attributeId: 2754, columnKey: "unsecured_long_term", value: null }, { attributeId: 2755, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "deposits_members", fieldTitle: "Deposits from Members", required: true, highlight: null, cells: [{ attributeId: 2756, columnKey: "field_title", value: "Deposits from Members" }, { attributeId: 2757, columnKey: "secured_long_term", value: null }, { attributeId: 2758, columnKey: "secured_short_term", value: null }, { attributeId: 2759, columnKey: "unsecured_long_term", value: null }, { attributeId: 2760, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "commercial_paper", fieldTitle: "Commercial paper", required: true, highlight: null, cells: [{ attributeId: 2761, columnKey: "field_title", value: "Commercial paper" }, { attributeId: 2762, columnKey: "secured_long_term", value: null }, { attributeId: 2763, columnKey: "secured_short_term", value: null }, { attributeId: 2764, columnKey: "unsecured_long_term", value: null }, { attributeId: 2765, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "term_loan_non_related", fieldTitle: "Term loan from any other company or body corporate (other than related party)", required: true, highlight: null, cells: [{ attributeId: 2766, columnKey: "field_title", value: "Term loan from any other company or body corporate (other than related party)" }, { attributeId: 2767, columnKey: "secured_long_term", value: null }, { attributeId: 2768, columnKey: "secured_short_term", value: null }, { attributeId: 2769, columnKey: "unsecured_long_term", value: null }, { attributeId: 2770, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "any_facilities_non_related", fieldTitle: "Any other kind of facilities / Loan repayable on demand: from any other company or body corporate (other than related party)", required: true, highlight: null, cells: [{ attributeId: 2771, columnKey: "field_title", value: "Any other kind of facilities / Loan repayable on demand: from any other company or body corporate (other than related party)" }, { attributeId: 2772, columnKey: "secured_long_term", value: null }, { attributeId: 2773, columnKey: "secured_short_term", value: null }, { attributeId: 2774, columnKey: "unsecured_long_term", value: null }, { attributeId: 2775, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "term_loan_related", fieldTitle: "Term loan from any other company or body corporate (which is related party)", required: true, highlight: null, cells: [{ attributeId: 2776, columnKey: "field_title", value: "Term loan from any other company or body corporate (which is related party)" }, { attributeId: 2777, columnKey: "secured_long_term", value: null }, { attributeId: 2778, columnKey: "secured_short_term", value: null }, { attributeId: 2779, columnKey: "unsecured_long_term", value: null }, { attributeId: 2780, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "any_facilities_related", fieldTitle: "Any other kind of facilities / Loan repayable on demand: from any other company or body corporate (which is related party)", required: true, highlight: null, cells: [{ attributeId: 2781, columnKey: "field_title", value: "Any other kind of facilities / Loan repayable on demand: from any other company or body corporate (which is related party)" }, { attributeId: 2782, columnKey: "secured_long_term", value: null }, { attributeId: 2783, columnKey: "secured_short_term", value: null }, { attributeId: 2784, columnKey: "unsecured_long_term", value: null }, { attributeId: 2785, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "from_directors", fieldTitle: "From directors", required: true, highlight: null, cells: [{ attributeId: 2786, columnKey: "field_title", value: "From directors" }, { attributeId: 2787, columnKey: "secured_long_term", value: null }, { attributeId: 2788, columnKey: "secured_short_term", value: null }, { attributeId: 2789, columnKey: "unsecured_long_term", value: null }, { attributeId: 2790, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "from_rel_directors", fieldTitle: "From relatives of directors", required: true, highlight: null, cells: [{ attributeId: 2791, columnKey: "field_title", value: "From relatives of directors" }, { attributeId: 2792, columnKey: "secured_long_term", value: null }, { attributeId: 2793, columnKey: "secured_short_term", value: null }, { attributeId: 2794, columnKey: "unsecured_long_term", value: null }, { attributeId: 2795, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "from_other_related", fieldTitle: "From any other related party", required: true, highlight: null, cells: [{ attributeId: 2796, columnKey: "field_title", value: "From any other related party" }, { attributeId: 2797, columnKey: "secured_long_term", value: null }, { attributeId: 2798, columnKey: "secured_short_term", value: null }, { attributeId: 2799, columnKey: "unsecured_long_term", value: null }, { attributeId: 2800, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "deferred_payment_liabilities", fieldTitle: "Deferred payment liabilities", required: true, highlight: null, cells: [{ attributeId: 2801, columnKey: "field_title", value: "Deferred payment liabilities" }, { attributeId: 2802, columnKey: "secured_long_term", value: null }, { attributeId: 2803, columnKey: "secured_short_term", value: null }, { attributeId: 2804, columnKey: "unsecured_long_term", value: null }, { attributeId: 2805, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "lt_maturities_lease", fieldTitle: "Long term maturities of financial lease obligations", required: true, highlight: null, cells: [{ attributeId: 2806, columnKey: "field_title", value: "Long term maturities of financial lease obligations" }, { attributeId: 2807, columnKey: "secured_long_term", value: null }, { attributeId: 2808, columnKey: "secured_short_term", value: null }, { attributeId: 2809, columnKey: "unsecured_long_term", value: null }, { attributeId: 2810, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "current_maturities_lt", fieldTitle: "Current maturities of long term borrowings", required: true, highlight: null, cells: [{ attributeId: 2811, columnKey: "field_title", value: "Current maturities of long term borrowings" }, { attributeId: 2812, columnKey: "secured_long_term", value: null }, { attributeId: 2813, columnKey: "secured_short_term", value: null }, { attributeId: 2814, columnKey: "unsecured_long_term", value: null }, { attributeId: 2815, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "any_borrowing_demand", fieldTitle: "Any borrowing repayable on demand from any other party", required: true, highlight: null, cells: [{ attributeId: 2816, columnKey: "field_title", value: "Any borrowing repayable on demand from any other party" }, { attributeId: 2817, columnKey: "secured_long_term", value: null }, { attributeId: 2818, columnKey: "secured_short_term", value: null }, { attributeId: 2819, columnKey: "unsecured_long_term", value: null }, { attributeId: 2820, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "any_other_borrowing", fieldTitle: "Any other borrowing from any other party", required: false, highlight: null, cells: [{ attributeId: 2821, columnKey: "field_title", value: "Any other borrowing from any other party" }, { attributeId: 2822, columnKey: "secured_long_term", value: null }, { attributeId: 2823, columnKey: "secured_short_term", value: null }, { attributeId: 2824, columnKey: "unsecured_long_term", value: null }, { attributeId: 2825, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "borrowings_guaranteed_directors", fieldTitle: "Borrowings guaranteed by directors", required: true, highlight: null, cells: [{ attributeId: 2826, columnKey: "field_title", value: "Borrowings guaranteed by directors" }, { attributeId: 2827, columnKey: "secured_long_term", value: null }, { attributeId: 2828, columnKey: "secured_short_term", value: null }, { attributeId: 2829, columnKey: "unsecured_long_term", value: null }, { attributeId: 2830, columnKey: "unsecured_short_term", value: null }] },
                ],
              },
            ],
            additionalFields: null,
          },
          // — AOC-4 content - Borrowings ———————————————————————————————————————————————————
          {
            subsectionId: "aoc4_borrowings_content",
            subsectionTitle: "AOC-4 content - Borrowings",
            fields: null,
            tables: [
              {
                tableId: "aoc4_unsecured_borrowings_table",
                tableTitle: null,
                type: "multi_column_table",
                columns: [
                  { columnId: "field_title", header: "AOC-4 content - Unsecured Borrowings", type: "label", prefix: null, subColumns: null },
                  { columnId: "unsecured_borrowing", header: "Unsecured borrowing", type: null, prefix: null, subColumns: [{ columnId: "unsecured_long_term", header: "Long term borrowing", type: "number", prefix: null }, { columnId: "unsecured_short_term", header: "Short term borrowing", type: "number", prefix: null }] },
                ],
                rows: [
                  { fieldId: "unsecured_bonds_deb", fieldTitle: "Unsecured bonds / debentures", required: true, highlight: null, cells: [{ attributeId: 3001, columnKey: "field_title", value: "Unsecured bonds / debentures" }, { attributeId: 3002, columnKey: "unsecured_long_term", value: null }, { attributeId: 6001, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "unsec_term_loans_banks", fieldTitle: "Unsecured term loans from banks", required: true, highlight: null, cells: [{ attributeId: 3004, columnKey: "field_title", value: "Unsecured term loans from banks" }, { attributeId: 3005, columnKey: "unsecured_long_term", value: null }, { attributeId: 6002, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "unsec_term_loans_other", fieldTitle: "Unsecured term loans from other parties", required: true, highlight: null, cells: [{ attributeId: 3007, columnKey: "field_title", value: "Unsecured term loans from other parties" }, { attributeId: 3008, columnKey: "unsecured_long_term", value: null }, { attributeId: 6003, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "unsec_loan_demand_banks", fieldTitle: "Unsecured loan repayable on demand from banks", required: true, highlight: null, cells: [{ attributeId: 3025, columnKey: "field_title", value: "Unsecured loan repayable on demand from banks" }, { attributeId: 6004, columnKey: "unsecured_long_term", value: null }, { attributeId: 3026, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "unsec_loan_demand_other", fieldTitle: "Unsecured loan repayable on demand from other parties", required: true, highlight: null, cells: [{ attributeId: 3027, columnKey: "field_title", value: "Unsecured loan repayable on demand from other parties" }, { attributeId: 6005, columnKey: "unsecured_long_term", value: null }, { attributeId: 3028, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "deferred_liabilities_aoc4", fieldTitle: "Deferred payment liabilities", required: true, highlight: null, cells: [{ attributeId: 3010, columnKey: "field_title", value: "Deferred payment liabilities" }, { attributeId: 3011, columnKey: "unsecured_long_term", value: null }, { attributeId: 6006, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "deposits_aoc4", fieldTitle: "Deposits", required: true, highlight: null, cells: [{ attributeId: 3013, columnKey: "field_title", value: "Deposits" }, { attributeId: 3014, columnKey: "unsecured_long_term", value: null }, { attributeId: 3015, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "loans_advances_related_aoc4", fieldTitle: "Loans and advances from related parties", required: true, highlight: null, cells: [{ attributeId: 3016, columnKey: "field_title", value: "Loans and advances from related parties" }, { attributeId: 3017, columnKey: "unsecured_long_term", value: null }, { attributeId: 3018, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "lt_maturities_lease_aoc4", fieldTitle: "Long term maturities of financial lease obligations", required: true, highlight: null, cells: [{ attributeId: 3029, columnKey: "field_title", value: "Long term maturities of financial lease obligations" }, { attributeId: 3030, columnKey: "unsecured_long_term", value: null }, { attributeId: 6007, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "other_loans_aoc4", fieldTitle: "Other loans and advances", required: true, highlight: null, cells: [{ attributeId: 3031, columnKey: "field_title", value: "Other loans and advances" }, { attributeId: 3032, columnKey: "unsecured_long_term", value: null }, { attributeId: 3033, columnKey: "unsecured_short_term", value: null }] },
                  { fieldId: "aggregate_lt_guaranteed", fieldTitle: "Aggregate long term borrowings guaranteed by directors", required: true, highlight: null, cells: [{ attributeId: 3034, columnKey: "field_title", value: "Aggregate long term borrowings guaranteed by directors" }, { attributeId: 3035, columnKey: "unsecured_long_term", value: null }, { attributeId: 3036, columnKey: "unsecured_short_term", value: null }] },
                ],
              },
              {
                tableId: "aoc4_secured_unsecured_table",
                tableTitle: null,
                type: "two_column_table",
                columns: [
                  { columnId: "field_title", header: "AOC-4 content - Secured & Unsecured Borrowings", type: "label", prefix: null, subColumns: null },
                  { columnId: "borrowing", header: "Borrowing", type: "number", prefix: null, subColumns: null },
                ],
                rows: [
                  { fieldId: "inter_corp_secured", fieldTitle: "Inter corporate borrowings - secured", required: true, highlight: null, cells: [{ attributeId: 3037, columnKey: "field_title", value: "Inter corporate borrowings - secured" }, { attributeId: 3038, columnKey: "borrowing", value: null }] },
                  { fieldId: "inter_corp_unsecured", fieldTitle: "Inter corporate borrowings - unsecured", required: true, highlight: null, cells: [{ attributeId: 3039, columnKey: "field_title", value: "Inter corporate borrowings - unsecured" }, { attributeId: 3040, columnKey: "borrowing", value: null }] },
                  { fieldId: "secured_loan_total", fieldTitle: "Secured loan (Total)", required: true, highlight: null, cells: [{ attributeId: 3019, columnKey: "field_title", value: "Secured loan (Total)" }, { attributeId: 3020, columnKey: "borrowing", value: null }] },
                  { fieldId: "conversion_warrants_deb", fieldTitle: "Conversion of warrants into debentures during the reporting period", required: true, highlight: null, cells: [{ attributeId: 3022, columnKey: "field_title", value: "Conversion of warrants into debentures during the reporting period" }, { attributeId: 3023, columnKey: "borrowing", value: null }] },
                ],
              },
            ],
            additionalFields: null,
          },
          // â”€â”€ Threshold master update â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            subsectionId: "threshold_master_update",
            subsectionTitle: "Threshold master update",
            fields: null,
            tables: [
              {
                tableId: "threshold_master_table",
                tableTitle: null,
                type: "two_column_table",
                columns: [
                  { columnId: "field_title", header: "Threshold master fields", type: "label", prefix: null, subColumns: null },
                  { columnId: "field_data",  header: "Amounts", type: "number", prefix: null, subColumns: null },
                ],
                rows: [
                  { fieldId: "thr_banks",               fieldTitle: "Borrowings from banks",                                                                                             required: true,  highlight: null, cells: [{ attributeId: 3101, columnKey: "field_title", value: "Borrowings from banks" },                                                                                             { attributeId: 3102, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_pfi",                 fieldTitle: "Borrowings from Public Financial Institutions",                                                                    required: true,  highlight: null, cells: [{ attributeId: 3103, columnKey: "field_title", value: "Borrowings from Public Financial Institutions" },                                                                    { attributeId: 3104, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_banks_pfi",           fieldTitle: "Borrowings from Banks + PFI",                                                                                      required: true,  highlight: null, cells: [{ attributeId: 3105, columnKey: "field_title", value: "Borrowings from Banks + PFI" },                                                                                      { attributeId: 3106, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_banks_pfi_cm",        fieldTitle: "Borrowings from Banks + PFI + Current maturities of long term borrowings",                                         required: true,  highlight: null, cells: [{ attributeId: 3107, columnKey: "field_title", value: "Borrowings from Banks + PFI + Current maturities of long term borrowings" },                                         { attributeId: 3108, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_other_fi",            fieldTitle: "Borrowings from Other Financial Institutions (other than banks, PFI)",                                              required: true,  highlight: null, cells: [{ attributeId: 3109, columnKey: "field_title", value: "Borrowings from Other Financial Institutions (other than banks, PFI)" },                                              { attributeId: 3110, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_banks_pfi_ofi_pd",   fieldTitle: "Borrowings from Banks + PFI + Other FI + Public Deposits",                                                         required: true,  highlight: null, cells: [{ attributeId: 3111, columnKey: "field_title", value: "Borrowings from Banks + PFI + Other FI + Public Deposits" },                                                         { attributeId: 3112, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_banks_pfi_ofi_pd_cm",fieldTitle: "Borrowings from Banks + PFI + Other FI + Public Deposits + Current maturities of long term borrowings",            required: true,  highlight: null, cells: [{ attributeId: 3113, columnKey: "field_title", value: "Borrowings from Banks + PFI + Other FI + Public Deposits + Current maturities of long term borrowings" },            { attributeId: 3114, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_public_deposits",     fieldTitle: "Public Deposits",                                                                                                  required: true,  highlight: null, cells: [{ attributeId: 3115, columnKey: "field_title", value: "Public Deposits" },                                                                                                  { attributeId: 3116, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_directors",           fieldTitle: "Borrowings from Directors (other than debentures)",                                                                 required: true,  highlight: null, cells: [{ attributeId: 3117, columnKey: "field_title", value: "Borrowings from Directors (other than debentures)" },                                                                 { attributeId: 3118, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_rel_directors",       fieldTitle: "Borrowings from Relatives of Directors (other than debentures)",                                                    required: true,  highlight: null, cells: [{ attributeId: 3119, columnKey: "field_title", value: "Borrowings from Relatives of Directors (other than debentures)" },                                                    { attributeId: 3120, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_rp_bodies",           fieldTitle: "Borrowings from other related parties: who are bodies corporate (other than debentures)",                          required: true,  highlight: null, cells: [{ attributeId: 3121, columnKey: "field_title", value: "Borrowings from other related parties: who are bodies corporate (other than debentures)" },                          { attributeId: 3122, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_rp_non_bodies",       fieldTitle: "Borrowings from other related parties: other than bodies corporate (other than debentures)",                       required: true,  highlight: null, cells: [{ attributeId: 3123, columnKey: "field_title", value: "Borrowings from other related parties: other than bodies corporate (other than debentures)" },                       { attributeId: 3124, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_inter_corp",          fieldTitle: "Inter corporate loans other than above (excluding debentures, if any)",                                             required: false, highlight: null, cells: [{ attributeId: 3125, columnKey: "field_title", value: "Inter corporate loans other than above (excluding debentures, if any)" },                                             { attributeId: 3126, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_deposits_members",    fieldTitle: "Deposits from Members",                                                                                             required: true,  highlight: null, cells: [{ attributeId: 3127, columnKey: "field_title", value: "Deposits from Members" },                                                                                             { attributeId: 3128, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_deb_bodies",          fieldTitle: "Debentures: from bodies corporate",                                                                                 required: true,  highlight: null, cells: [{ attributeId: 3129, columnKey: "field_title", value: "Debentures: from bodies corporate" },                                                                                 { attributeId: 3130, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_deb_other_bodies",    fieldTitle: "Debentures: from other than bodies corporate",                                                                      required: true,  highlight: null, cells: [{ attributeId: 3131, columnKey: "field_title", value: "Debentures: from other than bodies corporate" },                                                                      { attributeId: 3132, columnKey: "field_data", value: null }] },
                  { fieldId: "thr_bonds_cp_other",      fieldTitle: "Bonds / commercial paper / any other borrowing, other than mentioned above",                                       required: true,  highlight: null, cells: [{ attributeId: 3133, columnKey: "field_title", value: "Bonds / commercial paper / any other borrowing, other than mentioned above" },                                       { attributeId: 3134, columnKey: "field_data", value: null }] },
                ],
              },
            ],
            additionalFields: null,
          },
          // â”€â”€ Loans & Advances / LG5 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            subsectionId: "loans_and_advances_lg5",
            subsectionTitle: "Loans & Advances / LG5",
            fields: null,
            tables: [
              {
                tableId: "loans_advances_table",
                tableTitle: "AOC-4 contents - Long term loans and advances",
                type: "multi_column_table",
                columns: [
                  { columnId: "field_title", header: "Field title", type: "label", prefix: null, subColumns: null },
                  { columnId: "long_term", header: "Long term", type: null, prefix: null, subColumns: [{ columnId: "long_term_unsecured_good", header: "Unsecured - considered good", type: "currency", prefix: "Rs." }, { columnId: "long_term_unsecured_doubtful", header: "Unsecured - considered doubtful", type: "currency", prefix: "Rs." }, { columnId: "long_term_secured", header: "Secured", type: "currency", prefix: "Rs." }] },
                ],
                rows: [
                  { fieldId: "lt_capital_advances", fieldTitle: "Long term unsecured Capital advances", required: true, highlight: null, cells: [{ attributeId: 3201, columnKey: "field_title", value: "Long term unsecured Capital advances" }, { attributeId: 3202, columnKey: "long_term_unsecured_good", value: null }, { attributeId: 3203, columnKey: "long_term_unsecured_doubtful", value: null }, { attributeId: 3204, columnKey: "long_term_secured", value: null }] },
                  { fieldId: "loans_related_parties", fieldTitle: "Loans and advances to related parties", required: true, highlight: null, cells: [{ attributeId: 3205, columnKey: "field_title", value: "Loans and advances to related parties" }, { attributeId: 3206, columnKey: "long_term_unsecured_good", value: null }, { attributeId: 3207, columnKey: "long_term_unsecured_doubtful", value: null }, { attributeId: 3208, columnKey: "long_term_secured", value: null }] },
                  { fieldId: "other_loans", fieldTitle: "Other Loans and advances", required: true, highlight: null, cells: [{ attributeId: 3209, columnKey: "field_title", value: "Other Loans and advances" }, { attributeId: 3210, columnKey: "long_term_unsecured_good", value: null }, { attributeId: 3211, columnKey: "long_term_unsecured_doubtful", value: null }, { attributeId: 3212, columnKey: "long_term_secured", value: null }] },
                  { fieldId: "provision_bad_related", fieldTitle: "Provision/ allowance for bad and doubtful loans and advances: from related parties", required: true, highlight: null, cells: [{ attributeId: 3213, columnKey: "field_title", value: "Provision/ allowance for bad and doubtful loans and advances: from related parties" }, { attributeId: 3214, columnKey: "long_term_unsecured_good", value: null }, { attributeId: 3215, columnKey: "long_term_unsecured_doubtful", value: null }, { attributeId: 3216, columnKey: "long_term_secured", value: null }] },
                  { fieldId: "provision_bad_others", fieldTitle: "Provision/ allowance for bad and doubtful loans and advances: from others", required: true, highlight: null, cells: [{ attributeId: 3217, columnKey: "field_title", value: "Provision/ allowance for bad and doubtful loans and advances: from others" }, { attributeId: 3218, columnKey: "long_term_unsecured_good", value: null }, { attributeId: 3219, columnKey: "long_term_unsecured_doubtful", value: null }, { attributeId: 3220, columnKey: "long_term_secured", value: null }] },
                  { fieldId: "loans_due_directors", fieldTitle: "Loans and advances due by directors/ other officers of the company", required: true, highlight: null, cells: [{ attributeId: 3221, columnKey: "field_title", value: "Loans and advances due by directors/ other officers of the company" }, { attributeId: 3222, columnKey: "long_term_unsecured_good", value: null }, { attributeId: 3223, columnKey: "long_term_unsecured_doubtful", value: null }, { attributeId: 3224, columnKey: "long_term_secured", value: null }] },
                ],
              },
            ],
            dynamicGroups: [
              { groupId: "loans_given_outstanding", groupTitle: "Loans given and outstanding Threshold master update", addButtonLabel: "Add Entity", entityLabelPrefix: "Entity", fields: [{ attributeId: 3301, fieldId: "name_of_person_entity", label: "Name of person / entity", type: "text", placeholder: "Lorem ipsum", required: true, value: null }, { attributeId: 3302, fieldId: "amount", label: "Amount", type: "currency", prefix: "Rs.", required: true, value: null }, { attributeId: 3303, fieldId: "type_of_entity", label: "Type of entity", type: "text", placeholder: "Lorem ipsum", required: true, value: null }, { attributeId: 3304, fieldId: "relationship", label: "Relationship", type: "text", placeholder: "Lorem ipsum", required: true, value: null }], rows: [] },
              { groupId: "loans_given_repaid_back", groupTitle: "Loans given and repaid back", addButtonLabel: "Add Entity", entityLabelPrefix: "Entity", fields: [{ attributeId: 3305, fieldId: "lg_repaid_name", label: "Name of person / entity", type: "text", placeholder: "Lorem ipsum", required: true, value: null }, { attributeId: 3306, fieldId: "loan_given", label: "Loan given", type: "currency", prefix: "Rs.", required: true, value: null }, { attributeId: 3307, fieldId: "loan_repaid", label: "Loan repaid", type: "text", placeholder: "Lorem ipsum", required: true, value: null }, { attributeId: 3308, fieldId: "lg_repaid_type", label: "Type of entity", type: "text", placeholder: "Lorem ipsum", required: true, value: null }, { attributeId: 3309, fieldId: "lg_repaid_rel", label: "Relationship", type: "text", placeholder: "Lorem ipsum", required: true, value: null }], rows: [] },
            ],
            additionalFields: [
              { attributeId: 3401, fieldId: "loans_to_employees", label: "Loans given to other employees and outstanding", type: "currency", prefix: "Rs.", required: true, gridColumn: 1, value: null },
              { attributeId: 3402, fieldId: "inter_corporate_deposits", label: "Inter corporate deposits outstanding", type: "currency", prefix: "Rs.", required: true, gridColumn: 2, value: null },
            ],
          },
          // â”€â”€ Corporate Guarantees & Security â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            subsectionId: "corporate_guarantees_security",
            subsectionTitle: "Corporate Guarantees & Security",
            fields: null, tables: null,
            dynamicGroups: [
              { groupId: "corporate_guarantees_given_outstanding", groupTitle: "Corporate Guarantees given and outstanding Threshold master update", addButtonLabel: "Add Entity", entityLabelPrefix: "Entity", fields: [{ attributeId: 3501, fieldId: "cg_name", label: "Name of person / entity", type: "text", placeholder: "Lorem ipsum", required: true, value: null }, { attributeId: 3502, fieldId: "cg_loan_given", label: "Loan given", type: "currency", prefix: "Rs.", required: true, value: null }, { attributeId: 3503, fieldId: "cg_type_entity", label: "Type of entity", type: "text", placeholder: "Lorem ipsum", required: true, value: null }, { attributeId: 3504, fieldId: "cg_relationship", label: "Relationship", type: "text", placeholder: "Lorem ipsum", required: true, value: null }], rows: [] },
              { groupId: "security_given_data_outstanding", groupTitle: "Security given data and outstanding Threshold master update", addButtonLabel: "Add Entity", entityLabelPrefix: "Entity", fields: [{ attributeId: 3505, fieldId: "sg_name", label: "Name of person / entity", type: "text", placeholder: "Lorem ipsum", required: true, value: null }, { attributeId: 3506, fieldId: "sg_loan_given", label: "Loan given", type: "currency", prefix: "Rs.", required: true, value: null }, { attributeId: 3507, fieldId: "sg_type_entity", label: "Type of entity", type: "text", placeholder: "Lorem ipsum", required: true, value: null }, { attributeId: 3508, fieldId: "sg_relationship", label: "Relationship", type: "text", placeholder: "Lorem ipsum", required: true, value: null }], rows: [] },
            ],
            additionalFields: [
              { attributeId: 3601, fieldId: "securities_given_own_loan", label: "Securities given by company for loan taken by itself", type: "currency", prefix: "Rs.", required: true, gridColumn: 1, value: null },
            ],
          },
          // â”€â”€ Investments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            subsectionId: "investments",
            subsectionTitle: "Investments Threshold master update",
            fields: null, tables: null,
            dynamicGroups: [
              // 1. Investments in wholly owned subsidiaries (WOS)
              {
                groupId: "investments_wos",
                groupTitle: "Investments in wholly owned subsidiaries (WOS)",
                addButtonLabel: "+",
                entityLabelPrefix: "WOS",
                fields: [
                  { attributeId: 3701, fieldId: "wos_name",            label: "Name of WOS",                                        type: "text",     placeholder: "Lorem ipsum", required: true,  value: null },
                  { attributeId: 3702, fieldId: "wos_investment_amount",label: "Investment amount in this WOS",                      type: "number",   placeholder: "0",           required: true,  value: null },
                  { attributeId: 3703, fieldId: "wos_mgt6_filed",       label: "Whether MGT-6 filed by WOS?",                        type: "select",   placeholder: "Lorem ipsum", required: true,  value: null, options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
                  { attributeId: 3704, fieldId: "wos_bo_id",            label: "BO ID (Beneficial Owner Identification Number), if any", type: "text", placeholder: "AB12345CD",  required: false, value: null },
                ],
                rows: [],
              },
              // 2. Investment in WOS â†’ Subsidiary
              {
                groupId: "investments_subsidiary",
                groupTitle: "Investment in WOS",
                addButtonLabel: "+",
                entityLabelPrefix: "Subsidiary",
                fields: [
                  { attributeId: 3705, fieldId: "sub_name",             label: "Name of subsidiary (other than WOS)",                type: "text",   placeholder: "Lorem ipsum", required: true, value: null },
                  { attributeId: 3706, fieldId: "sub_investment_amount", label: "Investment amount in this subsidiary",               type: "number", placeholder: "0",           required: true, value: null },
                  { attributeId: 3707, fieldId: "sub_voting_power",      label: "% voting power in that subsidiary",                  type: "text",   placeholder: "1%",          required: true, value: null },
                ],
                rows: [],
              },
              // 3. Investments in LLPs
              {
                groupId: "investments_llp",
                groupTitle: "Investments in LLPs",
                addButtonLabel: "+",
                entityLabelPrefix: "LLP",
                fields: [
                  { attributeId: 3708, fieldId: "llp_name",             label: "Name of LLP",                                        type: "text",   placeholder: "Lorem ipsum", required: true, value: null },
                  { attributeId: 3709, fieldId: "llp_investment_amount", label: "Investment amount in this LLP",                      type: "number", placeholder: "0",           required: true, value: null },
                  { attributeId: 3710, fieldId: "llp_voting_power",      label: "% voting power in that LLP",                         type: "text",   placeholder: "1%",          required: true, value: null },
                ],
                rows: [],
              },
              // 4. Investments in Associate Companies
              {
                groupId: "investments_associate",
                groupTitle: "Investments in Associate Companies",
                addButtonLabel: "+",
                entityLabelPrefix: "Associate company",
                fields: [
                  { attributeId: 3711, fieldId: "assoc_name",             label: "Name of Associate company",                          type: "text",   placeholder: "Lorem ipsum", required: true, value: null },
                  { attributeId: 3712, fieldId: "assoc_investment_amount", label: "Investment amount in this Associate company",         type: "number", placeholder: "0",           required: true, value: null },
                  { attributeId: 3713, fieldId: "assoc_voting_power",      label: "% voting power in that Associate company",            type: "text",   placeholder: "1%",          required: true, value: null },
                ],
                rows: [],
              },
            ],
            additionalFieldsTitle: "Investments in Other Associates",
            additionalFields: [
              // plain fields grid
              { attributeId: 3801, fieldId: "invest_other_associates",      label: "Investments in Associates (other than mentioned above)", type: "number", required: true,  gridColumn: 1, defaultValue: "0", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 3802, fieldId: "invest_other_bodies",          label: "Investments in any other bodies",                        type: "number", required: true,  gridColumn: 2, defaultValue: "0", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 3803, fieldId: "invest_joint_ventures",        label: "Investments in joint ventures (other than mentioned above, but including investment in banks, AOP, BOI, society)", type: "number", required: true,  gridColumn: 3, defaultValue: "0", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 3804, fieldId: "invest_partnership_firms",     label: "Investments in Partnership firms",                       type: "number", required: true,  gridColumn: 4, defaultValue: "0", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 3805, fieldId: "invest_mutual_funds",          label: "Investments in mutual funds",                            type: "number", required: true,  gridColumn: 1, defaultValue: "0", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 3806, fieldId: "invest_fixed_deposits",        label: "Investments in fixed deposits",                          type: "number", required: true,  gridColumn: 2, defaultValue: "0", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 3807, fieldId: "invest_any_other",             label: "Any other investments (other than body corporate, but including investment in banks, AOP, BOI, society,)", type: "number", required: true, gridColumn: 3, defaultValue: "0", options: null, conditionalOn: null, highlight: null, value: null },
            ],
          },
          // â”€â”€ Trade receivables â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            subsectionId: "trade_receivables",
            subsectionTitle: "Trade receivables",
            fields: [
              { attributeId: 4001, fieldId: "tr_secured_good",       label: "Secured - considered good",                              type: "currency", prefix: "Rs.", required: true, gridColumn: 1, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 4002, fieldId: "tr_unsecured_good",     label: "Unsecured - considered good",                            type: "currency", prefix: "Rs.", required: true, gridColumn: 2, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 4003, fieldId: "tr_doubtful",           label: "Doubtful",                                               type: "currency", prefix: "Rs.", required: true, gridColumn: 3, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 4004, fieldId: "tr_provision_bad",      label: "Provision/ allowance for bad and doubtful debts",        type: "currency", prefix: "Rs.", required: true, gridColumn: 4, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 4005, fieldId: "tr_debt_due_directors", label: "Debt due by directors/ others officers of the company",  type: "currency", prefix: "Rs.", required: true, gridColumn: 1, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
            ],
            tables: null, dynamicGroups: null, additionalFields: null,
          },
          // â”€â”€ Property Plant & Equipment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            subsectionId: "property_plant_equipment",
            subsectionTitle: "Property Plant & Equipment",
            fields: [
              { attributeId: 4101, fieldId: "gross_ppe_intangible",      label: "Gross Property Plant and Equipment and Intangible Assets", type: "currency", prefix: "Rs.", required: true, gridColumn: 1, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
              { attributeId: 4102, fieldId: "depreciation_amortization", label: "Depreciation and amortization",                           type: "currency", prefix: "Rs.", required: true, gridColumn: 2, defaultValue: "1", options: null, conditionalOn: null, highlight: null, value: null },
            ],
            tables: null, dynamicGroups: null, additionalFields: null,
          },
        ],
        dynamicGroups: null, additionalFields: null,
      },

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // 4. COST AUDIT / COST RECORDS
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      {
        sectionId: "cost_audit_cost_records",
        sectionTitle: "Cost Audit / Cost records",
        theme: "pink",
        fields: [
          { attributeId: 4202, fieldId: "maintenance_mandated", label: "Whether maintenance of cost records by the company has been mandated under Companies (Cost Records and Audit) Rules, 2014", type: "radio", required: true, gridColumn: 1, defaultValue: "yes", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], conditionalOn: null, highlight: null, value: null },
          { attributeId: 4203, fieldId: "cta_codes_cost_records", label: "CTA Codes which require cost records maintenance", type: "text", required: true, gridColumn: 2, placeholder: "Lorem ipsum", defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
          { attributeId: 4204, fieldId: "audit_mandated_sni", label: "Whether audit of cost records of the company has been mandated under Rules specified in SNI", type: "radio", required: true, gridColumn: 3, defaultValue: "yes", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], conditionalOn: null, highlight: null, value: null },
          { attributeId: 4205, fieldId: "cta_codes_audit", label: "CTA Codes which require cost records maintenance", type: "text", required: true, gridColumn: 4, placeholder: "Lorem ipsum", defaultValue: null, options: null, conditionalOn: null, highlight: null, value: null },
        ],
        subsections: null, tables: null,
        dynamicGroups: [
          {
            groupId: "cta_codes_group",
            groupTitle: null,
            addButtonLabel: "+",
            entityLabelPrefix: "CTA code",
            fields: [
              { attributeId: 4201, fieldId: "all_cta_codes", label: "All CTA Codes of products / services of company for cost records maintenance", type: "currency", prefix: "Rs.", required: true, defaultValue: "20", value: null },
            ],
            rows: [],
          },
        ],
        additionalFields: null,
      },

    ],
  },
  status: 200,
};

const MOCK_AI_SUGGESTIONS = {
  2001: "01/04/2025",
  2002: "31/03/2026",
  2005: "Rajesh Kumar",
  2007: "Priya Sharma",
  2012: "2",
  2013: "Ankit Verma",
  2201: "5000000",
  2202: "250000",
  2203: "1000000",
  2204: "750000",
};

export function fetchFormDefinition(formId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_RESPONSE);
    }, 500);
  });
}

export function fetchAiSuggestions(formId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_AI_SUGGESTIONS);
    }, 500);
  });
}

export function saveFormData(formId, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 800);
  });
}
