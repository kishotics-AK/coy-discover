
import app from "./app";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(
    `Coy Discover backend running at http://localhost:${PORT}`
  );
});
