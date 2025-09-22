import { Delete, Edit, Preview, CheckCircle } from '@mui/icons-material';
import { Box, IconButton, Tooltip, CircularProgress } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ViewDetails from './viewDetails';
import { updatecrime, updateDetails, UpdateUpdeatedCrimeData } from 'state';
import { clearCrimeData, deleteCrimeDatas } from 'actions/crimeData';
import { useNavigate } from 'react-router-dom';
import { updateStatus, fetchCaseStats } from 'actions'; // ✅ import fetchCaseStats

function DataActions({ params, rowId, setRowId }) {
  const dispatch = useDispatch();
  const { _id, status, uid } = params.row;
  const currentUser = useSelector((state) => state.global.currentUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handelUpdate = () => {
    dispatch(updateDetails(params.row));
    dispatch(UpdateUpdeatedCrimeData(_id, uid));
    navigate('/add');
  };

  const markSolved = async () => {
    setLoading(true);

    const result = await updateStatus({ status: "Solved" }, _id, dispatch);

    if (result) {
      setSuccess(true);
      dispatch(fetchCaseStats()); // ✅ Refresh stats
      dispatch(updatecrime({ ...params.row, status: "Solved" })); // update row locally
      if (setRowId) setRowId(null);
    }

    setLoading(false);
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <ViewDetails />
      <Tooltip title="View details">
        <IconButton onClick={() => dispatch(updatecrime(params.row))}>
          <Preview />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit Data">
        <IconButton onClick={handelUpdate}>
          <Edit />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete Data">
        <IconButton onClick={() => deleteCrimeDatas(params.row, currentUser, dispatch)}>
          <Delete />
        </IconButton>
      </Tooltip>

<Tooltip title={status === "Solved" ? "Already Solved" : "Mark as Solved"}>
  <span>
    <IconButton
      onClick={markSolved}
      disabled={loading || status === "Solved"}
    >
      <CheckCircle style={{ color: "green" }} />
    </IconButton>
  </span>
</Tooltip>
    </Box>
  );
}

export default DataActions;
