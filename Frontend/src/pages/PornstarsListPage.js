"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Spin, Button, Card, Row, Col } from "antd"
import { UserOutlined } from "@ant-design/icons"
import api from "../utils/axiosConfig"
import "./Home.css"

const PornstarsListPage = () => {
  const navigate = useNavigate()
  
  const [pornstars, setPornstars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPornstars = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.get("/videos/tags")
        const tags = response.data.data.tags || []
        
        // Filter tags that could be considered pornstar names/types
        const pornstarTags = tags.filter(tag => 
          ["Brunette", "Blonde", "Asian", "Ebony", "Latina", "Redhead", 
           "Teen", "MILF", "Mature", "Young", "Petite", "Curvy"].includes(tag?.name)
        )
        
        // Add fallback pornstar categories if none found
        const fallbackPornstars = [
          "Brunette", "Blonde", "Asian", "Ebony", "Latina", "Redhead",
          "Teen", "MILF", "Mature", "Young", "Petite", "Curvy",
          "Amateur", "Professional", "European", "American"
        ]
        
        const finalPornstars = pornstarTags.length > 0 
          ? pornstarTags.map(tag => tag.name) 
          : fallbackPornstars
          
        setPornstars(finalPornstars)
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load pornstar categories. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPornstars()
  }, [])

  const handlePornstarClick = (pornstar) => {
    navigate(`/pornstars/${encodeURIComponent(pornstar)}`)
  }

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading pornstar categories...</p>
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
            Browse Pornstars
          </h1>
          <p className="home-subtitle">
            Discover content by performer categories
          </p>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        {pornstars.map((pornstar, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => handlePornstarClick(pornstar)}
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
                  src={`/placeholder.svg?height=120&width=200&text=${encodeURIComponent(pornstar)}`}
                  alt={pornstar}
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
                {pornstar}
              </h3>
              <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>
                Explore {pornstar.toLowerCase()} content
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default PornstarsListPage