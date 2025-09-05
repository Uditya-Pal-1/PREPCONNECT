import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// CORS configuration
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Initialize storage bucket
const bucketName = 'make-78cb9030-prepconnect-files'

// Create bucket on startup
async function initStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, { public: false })
      if (error) console.log('Bucket creation error:', error)
      else console.log('Storage bucket created successfully')
    }
  } catch (error) {
    console.log('Storage initialization error:', error)
  }
}

initStorage()

// Auth Routes
app.post('/make-server-78cb9030/signup', async (c) => {
  try {
    const { email, password, name, userType, ...profileData } = await c.req.json()
    
    if (!email || !password || !name || !userType) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, user_type: userType },
      email_confirm: true // Automatically confirm since no email server configured
    })

    if (authError) {
      console.log('Auth error during signup:', authError)
      return c.json({ error: authError.message }, 400)
    }

    // Store profile data in KV store
    const profileKey = `profile:${authData.user.id}`
    const profile = {
      id: authData.user.id,
      email,
      name,
      userType,
      createdAt: new Date().toISOString(),
      ...profileData
    }

    await kv.set(profileKey, profile)

    return c.json({ 
      user: { 
        id: authData.user.id, 
        email: authData.user.email,
        name,
        userType
      } 
    })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

app.get('/make-server-78cb9030/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const profile = await kv.get(`profile:${userId}`)
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404)
    }

    return c.json({ profile })
  } catch (error) {
    console.log('Profile fetch error:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

app.put('/make-server-78cb9030/profile/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userId = c.req.param('userId')
    if (user.id !== userId) {
      return c.json({ error: 'Cannot update another user\'s profile' }, 403)
    }

    const updates = await c.req.json()
    const existingProfile = await kv.get(`profile:${userId}`)
    
    if (!existingProfile) {
      return c.json({ error: 'Profile not found' }, 404)
    }

    const updatedProfile = { 
      ...existingProfile, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    }
    
    await kv.set(`profile:${userId}`, updatedProfile)
    return c.json({ profile: updatedProfile })
  } catch (error) {
    console.log('Profile update error:', error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// Get mentors list
app.get('/make-server-78cb9030/mentors', async (c) => {
  try {
    const profiles = await kv.getByPrefix('profile:')
    const mentors = profiles
      .filter(profile => profile.userType === 'mentor')
      .map(mentor => ({
        id: mentor.id,
        name: mentor.name,
        company: mentor.company,
        experience: mentor.experience,
        expertise: mentor.expertise,
        charges: mentor.charges,
        profileImage: mentor.profileImage,
        bio: mentor.bio
      }))
    
    return c.json({ mentors })
  } catch (error) {
    console.log('Mentors fetch error:', error)
    return c.json({ error: 'Failed to fetch mentors' }, 500)
  }
})

// Messaging Routes
app.post('/make-server-78cb9030/messages', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { recipientId, content } = await c.req.json()
    
    if (!recipientId || !content) {
      return c.json({ error: 'Missing recipient or message content' }, 400)
    }

    const messageId = crypto.randomUUID()
    const message = {
      id: messageId,
      senderId: user.id,
      recipientId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    }

    // Store message
    await kv.set(`message:${messageId}`, message)

    // Update conversation
    const conversationId = [user.id, recipientId].sort().join(':')
    const conversationKey = `conversation:${conversationId}`
    
    let conversation = await kv.get(conversationKey)
    if (!conversation) {
      conversation = {
        id: conversationId,
        participants: [user.id, recipientId],
        lastMessage: message,
        updatedAt: message.timestamp
      }
    } else {
      conversation.lastMessage = message
      conversation.updatedAt = message.timestamp
    }
    
    await kv.set(conversationKey, conversation)

    return c.json({ message })
  } catch (error) {
    console.log('Message send error:', error)
    return c.json({ error: 'Failed to send message' }, 500)
  }
})

app.get('/make-server-78cb9030/conversations/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userId = c.req.param('userId')
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized access to conversations' }, 403)
    }

    const conversations = await kv.getByPrefix('conversation:')
    const userConversations = conversations
      .filter(conv => conv.participants.includes(userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return c.json({ conversations: userConversations })
  } catch (error) {
    console.log('Conversations fetch error:', error)
    return c.json({ error: 'Failed to fetch conversations' }, 500)
  }
})

app.get('/make-server-78cb9030/messages/:conversationId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const conversationId = c.req.param('conversationId')
    
    // Verify user is part of conversation
    const conversation = await kv.get(`conversation:${conversationId}`)
    if (!conversation || !conversation.participants.includes(user.id)) {
      return c.json({ error: 'Access denied to conversation' }, 403)
    }

    const allMessages = await kv.getByPrefix('message:')
    const conversationMessages = allMessages
      .filter(msg => 
        (msg.senderId === conversation.participants[0] && msg.recipientId === conversation.participants[1]) ||
        (msg.senderId === conversation.participants[1] && msg.recipientId === conversation.participants[0])
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return c.json({ messages: conversationMessages })
  } catch (error) {
    console.log('Messages fetch error:', error)
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// File Upload Routes
app.post('/make-server-78cb9030/upload', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string // 'resume', 'notes', 'test'
    
    if (!file || !fileType) {
      return c.json({ error: 'Missing file or file type' }, 400)
    }

    // Create unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}/${fileType}/${Date.now()}.${fileExtension}`
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.log('File upload error:', uploadError)
      return c.json({ error: 'Failed to upload file' }, 500)
    }

    // Create signed URL
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 7) // 1 week expiry

    if (urlError) {
      console.log('Signed URL creation error:', urlError)
      return c.json({ error: 'Failed to create download link' }, 500)
    }

    // Store file metadata
    const fileId = crypto.randomUUID()
    const fileMetadata = {
      id: fileId,
      userId: user.id,
      fileName: file.name,
      fileType,
      filePath: fileName,
      uploadedAt: new Date().toISOString(),
      size: file.size
    }

    await kv.set(`file:${fileId}`, fileMetadata)

    return c.json({ 
      fileId,
      downloadUrl: signedUrlData.signedUrl,
      fileName: file.name,
      fileType 
    })
  } catch (error) {
    console.log('Upload process error:', error)
    return c.json({ error: 'File upload failed' }, 500)
  }
})

app.get('/make-server-78cb9030/files/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const requestedUserId = c.req.param('userId')
    
    const allFiles = await kv.getByPrefix('file:')
    const userFiles = allFiles
      .filter(file => file.userId === requestedUserId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    // Generate fresh signed URLs for files
    const filesWithUrls = await Promise.all(
      userFiles.map(async (file) => {
        const { data: signedUrlData } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(file.filePath, 60 * 60 * 24) // 24 hours
        
        return {
          ...file,
          downloadUrl: signedUrlData?.signedUrl || null
        }
      })
    )

    return c.json({ files: filesWithUrls })
  } catch (error) {
    console.log('Files fetch error:', error)
    return c.json({ error: 'Failed to fetch files' }, 500)
  }
})

// Connection Request Routes
app.post('/make-server-78cb9030/connection-request', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { mentorId, message } = await c.req.json()
    
    if (!mentorId) {
      return c.json({ error: 'Missing mentor ID' }, 400)
    }

    const requestId = crypto.randomUUID()
    const connectionRequest = {
      id: requestId,
      studentId: user.id,
      mentorId,
      message: message || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    await kv.set(`connection_request:${requestId}`, connectionRequest)

    return c.json({ request: connectionRequest })
  } catch (error) {
    console.log('Connection request error:', error)
    return c.json({ error: 'Failed to send connection request' }, 500)
  }
})

app.get('/make-server-78cb9030/connection-requests/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userId = c.req.param('userId')
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized access' }, 403)
    }

    const allRequests = await kv.getByPrefix('connection_request:')
    const userRequests = allRequests
      .filter(req => req.mentorId === userId || req.studentId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return c.json({ requests: userRequests })
  } catch (error) {
    console.log('Connection requests fetch error:', error)
    return c.json({ error: 'Failed to fetch connection requests' }, 500)
  }
})

// Update connection request status
app.post('/make-server-78cb9030/connection-request-update', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { requestId, status } = await c.req.json()
    
    if (!requestId || !status || !['accepted', 'rejected'].includes(status)) {
      return c.json({ error: 'Missing or invalid request ID or status' }, 400)
    }

    // Get the existing request
    const existingRequest = await kv.get(`connection_request:${requestId}`)
    if (!existingRequest) {
      return c.json({ error: 'Connection request not found' }, 404)
    }

    // Verify user is the mentor (only mentors can accept/reject requests)
    if (existingRequest.mentorId !== user.id) {
      return c.json({ error: 'Only the mentor can update this request' }, 403)
    }

    // Update the request status
    const updatedRequest = {
      ...existingRequest,
      status,
      updatedAt: new Date().toISOString()
    }

    await kv.set(`connection_request:${requestId}`, updatedRequest)

    return c.json({ request: updatedRequest })
  } catch (error) {
    console.log('Connection request update error:', error)
    return c.json({ error: 'Failed to update connection request' }, 500)
  }
})

// Posts Routes
app.post('/make-server-78cb9030/posts', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { title, content, imageUrl, tags } = await c.req.json()
    
    if (!title || !content) {
      return c.json({ error: 'Title and content are required' }, 400)
    }

    // Get user profile for author info
    const profile = await kv.get(`profile:${user.id}`)
    if (!profile) {
      return c.json({ error: 'User profile not found' }, 404)
    }

    const postId = crypto.randomUUID()
    const post = {
      id: postId,
      authorId: user.id,
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl || null,
      tags: tags || '',
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        name: profile.name,
        company: profile.company,
        experience: profile.experience,
        userType: profile.userType,
        expertise: profile.expertise
      }
    }

    await kv.set(`post:${postId}`, post)

    return c.json({ post })
  } catch (error) {
    console.log('Post creation error:', error)
    return c.json({ error: 'Failed to create post' }, 500)
  }
})

app.get('/make-server-78cb9030/posts', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const authorId = c.req.query('authorId')

    let allPosts = await kv.getByPrefix('post:')
    
    // Filter by author if specified
    if (authorId) {
      allPosts = allPosts.filter(post => post.authorId === authorId)
    }

    // Sort by creation date (newest first)
    allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const posts = allPosts.slice(startIndex, endIndex)

    return c.json({ 
      posts,
      pagination: {
        page,
        limit,
        total: allPosts.length,
        totalPages: Math.ceil(allPosts.length / limit),
        hasMore: endIndex < allPosts.length
      }
    })
  } catch (error) {
    console.log('Posts fetch error:', error)
    return c.json({ error: 'Failed to fetch posts' }, 500)
  }
})

app.get('/make-server-78cb9030/posts/:postId', async (c) => {
  try {
    const postId = c.req.param('postId')
    const post = await kv.get(`post:${postId}`)
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }

    return c.json({ post })
  } catch (error) {
    console.log('Post fetch error:', error)
    return c.json({ error: 'Failed to fetch post' }, 500)
  }
})

app.put('/make-server-78cb9030/posts/:postId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const postId = c.req.param('postId')
    const existingPost = await kv.get(`post:${postId}`)
    
    if (!existingPost) {
      return c.json({ error: 'Post not found' }, 404)
    }

    // Verify user is the author
    if (existingPost.authorId !== user.id) {
      return c.json({ error: 'Cannot edit another user\'s post' }, 403)
    }

    const { title, content, imageUrl, tags } = await c.req.json()
    
    const updatedPost = {
      ...existingPost,
      title: title || existingPost.title,
      content: content || existingPost.content,
      imageUrl: imageUrl !== undefined ? imageUrl : existingPost.imageUrl,
      tags: tags !== undefined ? tags : existingPost.tags,
      updatedAt: new Date().toISOString()
    }

    await kv.set(`post:${postId}`, updatedPost)

    return c.json({ post: updatedPost })
  } catch (error) {
    console.log('Post update error:', error)
    return c.json({ error: 'Failed to update post' }, 500)
  }
})

app.delete('/make-server-78cb9030/posts/:postId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const postId = c.req.param('postId')
    const existingPost = await kv.get(`post:${postId}`)
    
    if (!existingPost) {
      return c.json({ error: 'Post not found' }, 404)
    }

    // Verify user is the author
    if (existingPost.authorId !== user.id) {
      return c.json({ error: 'Cannot delete another user\'s post' }, 403)
    }

    await kv.del(`post:${postId}`)

    return c.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.log('Post deletion error:', error)
    return c.json({ error: 'Failed to delete post' }, 500)
  }
})

// Post Interactions
app.post('/make-server-78cb9030/posts/:postId/like', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const postId = c.req.param('postId')
    const post = await kv.get(`post:${postId}`)
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }

    const likeKey = `like:${postId}:${user.id}`
    const existingLike = await kv.get(likeKey)
    
    if (existingLike) {
      // Unlike the post
      await kv.del(likeKey)
      post.likes = Math.max(0, post.likes - 1)
      await kv.set(`post:${postId}`, post)
      
      return c.json({ liked: false, likes: post.likes })
    } else {
      // Like the post
      await kv.set(likeKey, {
        postId,
        userId: user.id,
        createdAt: new Date().toISOString()
      })
      post.likes = (post.likes || 0) + 1
      await kv.set(`post:${postId}`, post)
      
      return c.json({ liked: true, likes: post.likes })
    }
  } catch (error) {
    console.log('Post like error:', error)
    return c.json({ error: 'Failed to update like' }, 500)
  }
})

app.post('/make-server-78cb9030/posts/:postId/comments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const postId = c.req.param('postId')
    const { content } = await c.req.json()
    
    if (!content?.trim()) {
      return c.json({ error: 'Comment content is required' }, 400)
    }

    const post = await kv.get(`post:${postId}`)
    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }

    // Get user profile for author info
    const profile = await kv.get(`profile:${user.id}`)
    if (!profile) {
      return c.json({ error: 'User profile not found' }, 404)
    }

    const commentId = crypto.randomUUID()
    const comment = {
      id: commentId,
      postId,
      authorId: user.id,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      author: {
        name: profile.name,
        userType: profile.userType
      }
    }

    await kv.set(`comment:${commentId}`, comment)
    
    // Update post comment count
    post.comments = (post.comments || 0) + 1
    await kv.set(`post:${postId}`, post)

    return c.json({ comment })
  } catch (error) {
    console.log('Comment creation error:', error)
    return c.json({ error: 'Failed to create comment' }, 500)
  }
})

app.get('/make-server-78cb9030/posts/:postId/comments', async (c) => {
  try {
    const postId = c.req.param('postId')
    
    const allComments = await kv.getByPrefix('comment:')
    const postComments = allComments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    return c.json({ comments: postComments })
  } catch (error) {
    console.log('Comments fetch error:', error)
    return c.json({ error: 'Failed to fetch comments' }, 500)
  }
})

// Get user's liked posts
app.get('/make-server-78cb9030/posts/:postId/likes/:userId', async (c) => {
  try {
    const postId = c.req.param('postId')
    const userId = c.req.param('userId')
    
    const likeKey = `like:${postId}:${userId}`
    const like = await kv.get(likeKey)
    
    return c.json({ liked: !!like })
  } catch (error) {
    console.log('Like check error:', error)
    return c.json({ error: 'Failed to check like status' }, 500)
  }
})

Deno.serve(app.fetch)