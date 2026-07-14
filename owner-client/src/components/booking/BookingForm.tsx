import React from 'react';

export default function BookingForm() {
  return (
    <form>
      <label>From: <input type="date" name="from" /></label>
      <label>To: <input type="date" name="to" /></label>
      <button type="submit">Book</button>
    </form>
  );
}
