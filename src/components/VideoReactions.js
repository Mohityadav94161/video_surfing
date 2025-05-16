<Button 
  type="primary" 
  icon={reactions.currentUserReaction === 'like' ? <LikeFilled /> : <LikeOutlined />}
  style={{ backgroundColor: '#FF1493', borderColor: '#FF1493' }}
  onClick={() => handleReaction('like')}
>
  {reactions.likes}
</Button> 