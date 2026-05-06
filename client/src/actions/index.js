import axios from "axios";
import fetchData from "./utils/fetchData";
import { v4 as uuidv4 } from "uuid";
import uploadFile from "../firebase/uploadFile";
import {
  isLoading,
  notLoading,
  updateUsers,
  setAlert,
  updateUser,
  isCloseLogin,
  updateprofile,
} from "state";

const url = "http://localhost:9000/user";

// ✅ Fetch Case Stats
export const fetchCaseStats = () => async (dispatch) => {
  try {
    const res = await axios.get("http://localhost:9000/client/case-stats");
    if (res.data.success) {
      dispatch({ type: "SET_CASE_STATS", payload: res.data.stats });
    }
  } catch (err) {
    console.error("Failed to fetch case stats:", err);
  }
};

// ✅ User registration
export const register = async (user, dispatch) => {
  dispatch(isLoading());
  const result = await fetchData(
    { url: `${url}/register`, body: user },
    dispatch
  );
  if (result) {
    dispatch(updateUser(result));
    dispatch(isCloseLogin());
    dispatch(
      setAlert({
        open: true,
        severity: "success",
        message: "Your account has been created successfully",
      })
    );
  }
  dispatch(notLoading());
};

// ✅ User login
export const login = async (user, dispatch) => {
  dispatch(isLoading());
  const result = await fetchData({ url: `${url}/login`, body: user }, dispatch);
  if (result) {
    dispatch(updateUser(result));
    dispatch(isCloseLogin());
  }
  dispatch(notLoading());
};

// ✅ Update Profile
export const updateProfile = async (currentUser, updatedFields, dispatch) => {
  dispatch(isLoading());
  const { name, file } = updatedFields;
  let body = { name };

  try {
    if (file) {
      const imageName = uuidv4() + "." + file?.name?.split(".")?.pop();
      const photoURL = await uploadFile(file, `profile/${currentUser?.id}/${imageName}`);
      body = { ...body, photoURL };
    }

    const result = await fetchData(
      {
        url: `${url}/updateProfile`,
        method: "PATCH",
        body,
        token: currentUser.token,
      },
      dispatch
    );

    if (result) {
      dispatch(updateUser({ ...currentUser, ...result }));
      dispatch(
        setAlert({
          open: true,
          severity: "success",
          message: "Your profile has been updated successfully",
        })
      );
      dispatch(
        updateprofile({ open: false, file: null, photoURL: result.photoURL })
      );
    }
  } catch (error) {
    dispatch(
      setAlert({
        open: true,
        severity: "error",
        message: error.message,
      })
    );
    console.log(error);
  }

  dispatch(notLoading());
};

// ✅ Get all users
export const getUsers = async (dispatch) => {
  const result = await fetchData({ url, method: "GET" }, dispatch);
  if (result) dispatch(updateUsers(result));
};

// ✅ Update Crime Status (Mark as Solved)
export const updateStatus = async (body, crimeId, dispatch) => {
  try {
    const res = await fetch(`http://localhost:9000/client/crime/${crimeId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Check if response is JSON
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Response not JSON:", text);
      return null;
    }

    if (data.success) {
      // ✅ Optionally refresh case stats after marking solved
      if (dispatch) dispatch(fetchCaseStats());
      return data.result;
    }
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};
