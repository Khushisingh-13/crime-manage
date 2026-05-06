import {
  updateCrimeData,
  isLoading,
  notLoading,
  setAlert,
  resetDetails,
} from "state";
import fetchData from "./utils/fetchData";

const url = process.env.REACT_APP_BASE_URL + "/client";

// ✅ Create new crime record
export const createCrimeData = async (CrimeData, currentUser, dispatch) => {
  dispatch(isLoading());

  const result = await fetchData(
    { url, body: CrimeData, token: currentUser?.token },
    dispatch
  );

  if (result) {
    dispatch(
      setAlert({
        open: true,
        severity: "success",
        message: "The data has been added successfully",
      })
    );
    clearCrimeData(dispatch);
    dispatch(updateCrimeData(result));
    getCrimeDatas(dispatch); // refresh table
  }

  dispatch(notLoading());
};

// ✅ Get all crime data
export const getCrimeDatas = async (dispatch) => {
  const result = await fetchData({ url: url + "/crimedata", method: "GET" }, dispatch);
  if (result) {
    dispatch(updateCrimeData(result));
  }
};

// ✅ Delete a crime record
export const deleteCrimeDatas = async (CrimeData, currentUser, dispatch) => {
  dispatch(isLoading());
  const result = await fetchData(
    { url: `${url}/${CrimeData._id}`, method: "DELETE", token: currentUser?.token },
    dispatch
  );
  if (result) {
    dispatch(
      setAlert({
        open: true,
        severity: "success",
        message: "The data has been deleted successfully",
      })
    );
  }

  getCrimeDatas(dispatch); // refresh table
  dispatch(notLoading());
};

// ✅ Update crime status
export const updateCrimeStatus = async (dispatch, crimeId, status) => {
  dispatch(isLoading());

  const result = await fetchData(
    {
      url: `${url}/crime/${crimeId}/status`,
      method: "PUT",
      body: { status },
      token: localStorage.getItem("token"),
    },
    dispatch
  );

  if (result && result.success) {
    getCrimeDatas(dispatch); // refresh table after update
  } else {
    console.error("Failed to update crime status");
  }

  dispatch(notLoading());
};

// ✅ Clear crime data in redux
export const clearCrimeData = (dispatch) => {
  dispatch(resetDetails());
};
