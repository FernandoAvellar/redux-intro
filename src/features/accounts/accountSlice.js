import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

const accountSlice = createSlice({
  name: "account",
  initialState: initialState,
  reducers: {
    deposit(state, action) {
      state.balance += action.payload;
      state.isLoading = false;
    },
    withdraw(state, action) {
      state.balance -= action.payload;
    },
    requestLoan: {
      prepare(amount, purpose) {
        return {
          payload: { amount, purpose },
        };
      },
      reducer(state, action) {
        if (state.loan > 0) return;
        state.loan = action.payload.amount;
        state.loanPurpose = action.payload.purpose;
        state.balance += action.payload.amount;
      },
    },
    payLoan(state) {
      state.balance -= state.loan;
      state.loanPurpose = "";
      state.loan = 0;
    },
    convertingCurrency(state) {
      state.isLoading = true;
    },
  },
});

//Solved the problem but the more indicated way to use thunk in a reduxtoolkit is to use createAsyncThunk
export function deposit(amount, currency) {
  if (currency === "USD") return { type: "account/deposit", payload: amount };

  //if returns a function redux will pass it to the thunx middleware
  return async function (dispatch, getState) {
    dispatch({ type: "account/convertingCurrency" });
    const res = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`
    );
    const data = await res.json();
    const convertedAmount = data.rates.USD;

    dispatch({ type: "account/deposit", payload: convertedAmount });
  };
}

export const { withdraw, requestLoan, payLoan } = accountSlice.actions;

export default accountSlice.reducer;

/* Solution using asyncThunkCreator
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
 
// Account initial state
const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};
 
// Define the async thunk using createAsyncThunk
export const depositAsync = createAsyncThunk(
  "account/deposit",
  async (params, { dispatch, getState }) => {
    const { amount, currency } = params;
 
    if (currency === "USD") {
      return amount;
    }
 
    const res = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`
    );
 
    const data = await res.json();
    const convertedAmount = data.rates.USD;
 
    return convertedAmount;
  }
);
 
const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    withdraw(state, action) {
      state.balance -= action.payload;
    },
    requestLoan: {
      prepare(amount, purpose) {
        return {
          payload: { amount, purpose },
        };
      },
      reducer(state, action) {
        if (state.loan > 0) return;
        state.loan = action.payload.amount;
        state.loanPurpose = action.payload.purpose;
        state.balance += action.payload.amount;
      },
    },
    payLoan(state) {
      state.balance -= state.loan;
      state.loan = 0;
      state.loanPurpose = "";
    },
    convertCurrency(state) {
      state.isLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(depositAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(depositAsync.fulfilled, (state, action) => {
        state.balance += action.payload;
        state.isLoading = false;
        console.log("fulfilled");
      })
      .addCase(depositAsync.rejected, (state) => {
        state.isLoading = false;
        console.log("rejected");
      });
  },
});
 
export const { deposit, withdraw, requestLoan, payLoan, convertCurrency } =
  accountSlice.actions;
 
export default accountSlice.reducer; */
