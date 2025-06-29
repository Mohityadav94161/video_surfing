"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Spin, Button, Card, Row, Col } from "antd"
import { FolderOutlined } from "@ant-design/icons"
import api from "../utils/axiosConfig"
import "./Home.css"

const CategoriesListPage = () => {
  const navigate = useNavigate()
  
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.get("/videos/categories")
        const categoriesData = response.data.data.categories || []
        
        // Add fallback categories if none found
        const fallbackCategories = [
          "Amateur", "Anal", "Asian", "BBW", "Big Ass", "Big Tits",
          "Blonde", "Blowjob", "Brunette", "Cumshot", "Ebony", "MILF",
          "Lesbian", "Teen", "Mature", "Petite", "Busty", "Latina"
        ]
        
        const finalCategories = categoriesData.length > 0 ? categoriesData : fallbackCategories
        setCategories(finalCategories)
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load categories. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryClick = (category) => {
    navigate(`/categories/${encodeURIComponent(category)}`)
  }

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading categories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-container">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="home-title-section">
          <h1 className="home-title">
            Browse Categories
          </h1>
          <p className="home-subtitle">
            Discover videos by category
          </p>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        {categories.map((category, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => handleCategoryClick(category)}
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                textAlign: 'center'
              }}
              bodyStyle={{
                padding: '20px',
                color: 'white'
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <img
                  src={`/categories/${category.toLowerCase()}.jpg`}
                  alt={category}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "/home.jpg"
                  }}
                />
              </div>
              <h3 style={{ color: '#FF1493', marginBottom: '5px', fontSize: '16px' }}>
                {category}
              </h3>
              <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>
                Explore {category.toLowerCase()} videos
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default CategoriesListPage