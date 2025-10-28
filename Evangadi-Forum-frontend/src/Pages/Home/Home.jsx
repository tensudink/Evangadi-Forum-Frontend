import React, { useContext, useEffect, useState, useCallback } from "react";
import Layout from "../../component/Layout/Layout";
import classes from "./home.module.css";
import { Link, useNavigate } from "react-router-dom";
import QuestionList from "../Questionlist/QuestionList";
import { UserContext } from "../../component/Dataprovider/DataProvider";
import axios from "../../axiosConfig"; // Import axios
import LoadingSpinner from "../../component/LoadingSpinner/LoadingSpinner";

function Home() {
  const [userData] = useContext(UserContext);
  const navigate = useNavigate();

  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isLoggedIn = !!userData?.user;
  const token = userData?.token || localStorage.getItem("token");

  // 🔹 Fetch Questions
  const fetchQuestions = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("/api/question", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.questions && Array.isArray(res.data.questions)) {
        setAllQuestions(res.data.questions);
      } else {
        setAllQuestions([]);
        setError("Invalid response format from server.");
      }
    } catch (err) {
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 🔹 Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // 🔹 Auto-fetch as soon as user logs in or token becomes available
  useEffect(() => {
    if (token) {
      fetchQuestions();
    }
  }, [fetchQuestions, token]);

  const handleSearchInputChange = (e) => setSearchQuery(e.target.value);

  const questionsToShow = allQuestions.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <Layout>
        <div className={classes.container}>
          <LoadingSpinner text="Loading questions..." />
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <div className={classes.container}>
          <div className="alert alert-danger text-center">{error}</div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className={classes.container}>
        {/* Header */}
        <div className={classes.userActions}>
          <span className={classes.welcomeText}>
            Welcome:{" "}
            <span className={classes.username}>
              {userData.user?.display_name ||
                userData.user?.user_name ||
                userData.user?.username ||
                "Guest"}
            </span>
          </span>

          <div className={classes.askButtonContainer}>
            <Link to="/question" className={classes.askButton}>
              Ask Question
            </Link>
          </div>

          <div className={classes.searchBox}>
            <input
              type="text"
              placeholder="Search question"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
          </div>
        </div>

        {/* Question List */}
        <div className={classes.questionsSection}>
          {questionsToShow.length === 0 && searchQuery ? (
            <p className={classes.emptyMessage}>
              No results found for "{searchQuery}".
            </p>
          ) : (
            <QuestionList questions={questionsToShow} />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Home;
