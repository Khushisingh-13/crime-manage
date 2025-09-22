import React, { useEffect, useMemo, useState } from "react";
import { Box, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { useGetCrimeDataQuery } from "state/api";
import Header from "components/Header";
import DataGridCustomToolbar from "components/DataGridCustomToolbar";
import Protected from "scenes/protected/Protected";
import DataActions from "./DataActions";
import { getCrimeDatas } from "actions/crimeData";

const CrimeData = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Pagination, sorting, and search states
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState({});
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [hasFetchedFallback, setHasFetchedFallback] = useState(false);

  // Redux selectors
  const currentUser = useSelector((state) => state.global.currentUser);
  const fallbackCrimeData = useSelector((state) => state.global.crimeData);

  // API call via RTK Query
  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      sort: JSON.stringify(sort),
      search,
    }),
    [page, pageSize, sort, search]
  );

  const { data, isLoading } = useGetCrimeDataQuery(queryParams);

  // Debugging logs
  console.log("API Data:", data);
  console.log("Fallback Data:", fallbackCrimeData);

  // Load fallback data only once if not available
  useEffect(() => {
    console.log("daddy calle !!!!");
    const shouldFetchFallback =
      !hasFetchedFallback &&
      !isLoading &&
      !data?.crimeData?.length &&
      !fallbackCrimeData?.crimeData?.length;

    if (shouldFetchFallback) {
      getCrimeDatas(dispatch);
      setHasFetchedFallback(true);
    }
  }, [dispatch, data, fallbackCrimeData, isLoading, hasFetchedFallback]);

  // Define columns with more robust field definitions
  const columns = useMemo(
    () => [
      {
        field: "crm_cd",
        headerName: "Crime Code",
        flex: 0.4,
        valueGetter: (params) => params.row.crm_cd || "N/A",
      },
      {
        field: "date_occ",
        headerName: "Occurred Date",
        flex: 0.7,
        valueGetter: (params) => params.row.date_occ || "N/A",
      },
      {
        field: "area_name",
        headerName: "Area",
        flex: 0.5,
        valueGetter: (params) => params.row.area_name || "N/A",
      },
      {
        field: "crm_cd_desc",
        headerName: "Type of Crime",
        flex: 1,
        valueGetter: (params) => params.row.crm_cd_desc || "N/A",
      },
      {
        field: "vict_sex",
        headerName: "Vict Sex",
        flex: 0.4,
        valueGetter: (params) => params.row.vict_sex || "N/A",
      },
      {
        field: "vict_age",
        headerName: "Vict Age",
        flex: 0.4,
        valueGetter: (params) => params.row.vict_age || "N/A",
      },
      {
        field: "premis_desc",
        headerName: "Premises Description",
        flex: 1,
        valueGetter: (params) => params.row.premis_desc || "N/A",
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        renderCell: (params) => <DataActions {...{ params }} />,
      },
    ],
    []
  );

  // Process rows data with fallbacks
  const rows = useMemo(() => {
    const apiData = data?.crimeData || [];
    const fallbackData = fallbackCrimeData?.crimeData || [];
    const combinedData = [...apiData, ...fallbackData];

    console.log("Processed Rows:", combinedData);
    return combinedData;
  }, [data, fallbackCrimeData]);

  const rowCount = data?.total || fallbackCrimeData?.total || 0;

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="CRIME DATA" subtitle="Entire list of crimes from 2020" />
      <Box
        height="80vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            minHeight: "300px", // Ensure minimum height
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
            padding: "8px", // Add some padding
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: theme.palette.primary.light,
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderTop: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${theme.palette.secondary[200]} !important`,
          },
        }}
      >
        {currentUser ? (
          <DataGrid
            loading={isLoading}
            rows={rows}
            columns={columns}
            getRowId={(row) =>
              row._id || Math.random().toString(36).substr(2, 9)
            }
            rowCount={rowCount}
            rowsPerPageOptions={[20, 50, 100]}
            pagination
            page={page}
            pageSize={pageSize}
            paginationMode="server"
            sortingMode="server"
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            onSortModelChange={(newSortModel) => {
              const sortObj = newSortModel[0] || {};
              setSort({ [sortObj.field]: sortObj.sort });
            }}
            components={{ Toolbar: DataGridCustomToolbar }}
            componentsProps={{
              toolbar: { searchInput, setSearchInput, setSearch },
            }}
            sx={{
              "--DataGrid-overlayHeight": "300px", // Ensure overlay height
            }}
            localeText={{
              noRowsLabel: "No crime data available",
              errorOverlayDefaultLabel: "An error occurred while loading data.",
            }}
          />
        ) : (
          <Protected />
        )}
      </Box>
    </Box>
  );
};

export default CrimeData;
