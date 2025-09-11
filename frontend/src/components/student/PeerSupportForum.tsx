import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MessageCircle, Heart, Clock, Users, Plus, Flag, ThumbsUp, Eye, MessageSquare, Shield, AlertTriangle } from 'lucide-react';
import { useAutoModeration } from '../ForumModeration';
import { useAuth } from '../auth/AuthProvider';
import webSocketService from '../../services/websocket';

interface PeerSupportForumProps {
  language: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  views: number;
  isAnonymous: boolean;
  isModerated: boolean;
  isSensitive?: boolean;
}

interface Reply {
  id: string;
  postId: string;
  content: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  likes: number;
  isAnonymous: boolean;
}

const forumPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Dealing with exam anxiety - anyone else struggling?',
    content: 'Finals are approaching and I\'m feeling overwhelmed. The pressure from family and my own expectations is getting to me. Has anyone found effective ways to manage this?',
    author: 'Student_JK',
    timestamp: '2 hours ago',
    category: 'Academic Stress',
    tags: ['anxiety', 'exams', 'pressure'],
    likes: 12,
    replies: 8,
    views: 45,
    isAnonymous: true,
    isModerated: true
  },
  {
    id: '2',
    title: 'Finding balance between studies and mental health',
    content: 'I\'ve been struggling to maintain good grades while taking care of my mental health. Sometimes I feel guilty for taking breaks. How do you all manage this balance?',
    author: 'Priya_K',
    timestamp: '5 hours ago',
    category: 'Self Care',
    tags: ['balance', 'guilt', 'studies'],
    likes: 18,
    replies: 12,
    views: 67,
    isAnonymous: false,
    isModerated: true
  },
  {
    id: '3',
    title: 'Home environment affecting studies',
    content: 'Living at home while studying online has been challenging. Family doesn\'t always understand when I need quiet time or space. Any tips for creating boundaries?',
    author: 'Anonymous_User',
    timestamp: '1 day ago',
    category: 'Family & Relationships',
    tags: ['family', 'boundaries', 'online-learning'],
    likes: 15,
    replies: 9,
    views: 89,
    isAnonymous: true,
    isModerated: true,
    isSensitive: true
  },
  {
    id: '4',
    title: 'Celebrating small wins',
    content: 'Just wanted to share that I finally started meditation practice after weeks of putting it off. It\'s been 5 days straight! Small steps count too 😊',
    author: 'Hopeful_Student',
    timestamp: '2 days ago',
    category: 'Success Stories',
    tags: ['meditation', 'progress', 'positive'],
    likes: 25,
    replies: 15,
    views: 78,
    isAnonymous: false,
    isModerated: true
  }
];

const categories = [
  { id: 'all', label: 'All Posts', labelHi: 'सभी पोस्ट', labelUr: 'تمام پوسٹس', icon: MessageCircle },
  { id: 'academic', label: 'Academic Stress', labelHi: 'शैक्षणिक तनाव', labelUr: 'تعلیمی دباؤ', icon: MessageCircle },
  { id: 'selfcare', label: 'Self Care', labelHi: 'आत्म देखभाल', labelUr: 'خود کی دیکھ بھال', icon: Heart },
  { id: 'family', label: 'Family & Relationships', labelHi: 'परिवार और रिश्ते', labelUr: 'خاندان اور رشتے', icon: Users },
  { id: 'success', label: 'Success Stories', labelHi: 'सफलता की कहानियां', labelUr: 'کامیابی کی کہانیاں', icon: ThumbsUp }
];

export function PeerSupportForum({ language }: PeerSupportForumProps) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [moderationWarning, setModerationWarning] = useState('');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [newReply, setNewReply] = useState('');
  
  const { checkContent } = useAutoModeration();

  const texts = {
    en: {
      title: 'Peer Support Forum',
      subtitle: 'Connect with fellow students, share experiences, and support each other',
      newPost: 'New Post',
      anonymous: 'Post Anonymously',
      postTitle: 'Post Title',
      postContent: 'Share your thoughts...',
      submit: 'Post',
      cancel: 'Cancel',
      likes: 'likes',
      replies: 'replies',
      views: 'views',
      moderatedBadge: 'Moderated',
      sensitiveBadge: 'Sensitive Content',
      safetyNotice: 'This is a safe space. All posts are moderated and guidelines enforced.',
      crisisWarning: 'If you\'re in crisis, please contact emergency services or Tele-MANAS: 104',
      guidelines: 'Community Guidelines',
      report: 'Report',
      reply: 'Reply',
      backToForum: 'Back to Forum'
    },
    hi: {
      title: 'सहयोगी सहायता मंच',
      subtitle: 'साथी छात्रों से जुड़ें, अनुभव साझा करें, और एक-दूसरे का समर्थन करें',
      newPost: 'नई पोस्ट',
      anonymous: 'गुमनाम रूप से पोस्ट करें',
      postTitle: 'पोस्ट शीर्षक',
      postContent: 'अपने विचार साझा करें...',
      submit: 'पोस्ट करें',
      cancel: 'रद्द करें',
      likes: 'पसंद',
      replies: 'उत्तर',
      views: 'दृश्य',
      moderatedBadge: 'संयमित',
      sensitiveBadge: 'संवेदनशील सामग्री',
      safetyNotice: 'यह एक सुरक्षित स्थान है। सभी पोस्ट संयमित हैं और दिशानिर्देश लागू किए गए हैं।',
      crisisWarning: 'यदि आप संकट में हैं, तो कृपया आपातकालीन सेवाओं या टेली-मानस से संपर्क करें: 104',
      guidelines: 'समुदायिक दिशानिर्देश',
      report: 'रिपोर्ट करें',
      reply: 'उत्तर दें',
      backToForum: 'मंच पर वापस'
    },
    ur: {
      title: 'ہمساکھا سپورٹ فورم',
      subtitle: 'ساتھی طلباء سے جڑیں، تجربات شیئر کریں، اور ایک دوسرے کی مدد کریں',
      newPost: 'نئی پوسٹ',
      anonymous: 'گمنام طریقے سے پوسٹ کریں',
      postTitle: 'پوسٹ کا عنوان',
      postContent: 'اپنے خیالات شیئر کریں...',
      submit: 'پوسٹ کریں',
      cancel: 'منسوخ کریں',
      likes: 'پسند',
      replies: 'جوابات',
      views: 'ملاحظات',
      moderatedBadge: 'معتدل',
      sensitiveBadge: 'حساس مواد',
      safetyNotice: 'یہ ایک محفوظ جگہ ہے۔ تمام پوسٹس کو معتدل کیا جاتا ہے اور رہنمائی نافذ کی جاتی ہے۔',
      crisisWarning: 'اگر آپ بحران میں ہیں تو برائے کرم ایمرجنسی سروسز یا ٹیلی مانس سے رابطہ کریں: 104',
      guidelines: 'کمیونٹی کے رہنمائیاں',
      report: 'رپورٹ',
      reply: 'جواب',
      backToForum: 'فورم پر واپس'
    }
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  // Load posts from backend
  const loadPosts = async () => {
    try {
      const { api } = await import('../../services/api');
      const response = await api.get('/forum/posts', {
        params: {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          language: language || 'en'
        }
      });
      
      if (response.data.success) {
        setPosts(response.data.data.posts || []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      // Fallback to mock data
      setPosts(forumPosts);
    }
  };

  // Load replies for a specific post
  const loadReplies = async (postId: string) => {
    try {
      const { api } = await import('../../services/api');
      const response = await api.get(`/forum/posts/${postId}`);
      
      if (response.data.success) {
        setReplies(response.data.data.replies || []);
      }
    } catch (error) {
      console.error('Error loading replies:', error);
      setReplies([]);
    }
  };

  // Setup WebSocket listeners for real-time forum updates
  useEffect(() => {
    const setupWebSocket = async () => {
      if (!user) return;
      
      try {
        if (!webSocketService.isConnected()) {
          await webSocketService.connect(user.id);
        }

        // Listen for new posts
        webSocketService.on('new-post', (data) => {
          console.log('New post received:', data);
          loadPosts(); // Refresh posts list
        });

      } catch (error) {
        console.error('WebSocket setup failed for forum:', error);
      }
    };

    setupWebSocket();

    return () => {
      // Cleanup WebSocket listeners
      if (webSocketService.isConnected()) {
        webSocketService.off('new-post', () => {});
      }
    };
  }, [user]);

  // Load data when component mounts or category changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadPosts();
      setLoading(false);
    };
    
    loadData();
  }, [selectedCategory]);

  // Load replies when a post is selected
  useEffect(() => {
    if (selectedPost) {
      loadReplies(selectedPost.id);
    }
  }, [selectedPost]);

  const filteredPosts = posts;

  const handleSubmitPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !user) return;
    
    try {
      setSubmittingPost(true);
      
      // Check content for moderation before submission
      const fullContent = `${newPostTitle} ${newPostContent}`;
      const moderationResult = checkContent(fullContent, language as 'en' | 'hi' | 'ur');
      
      if (moderationResult.flagged) {
        if (moderationResult.severity === 'high') {
          setModerationWarning('Your post contains high-risk content and will be reviewed before publishing. If you need immediate help, please contact Tele-MANAS: 104');
          return;
        } else if (moderationResult.severity === 'medium') {
          setModerationWarning('Your post will be reviewed before publishing to ensure community safety.');
        }
      }
      
      // Submit to backend API
      const { api } = await import('../../services/api');
      const response = await api.post('/forum/posts', {
        title: newPostTitle,
        content: newPostContent,
        category: selectedCategory !== 'all' ? selectedCategory : 'general',
        isAnonymous,
        language: language || 'en',
        moderation: moderationResult
      });
      
      if (response.data.success) {
        console.log('Post submitted successfully:', response.data.data);
        
        // Add new post to local state immediately
        const newPost: ForumPost = {
          id: response.data.data.id,
          title: newPostTitle,
          content: newPostContent,
          author: isAnonymous ? 'Anonymous' : user.email.split('@')[0],
          timestamp: 'just now',
          category: selectedCategory !== 'all' ? selectedCategory : 'general',
          tags: [],
          likes: 0,
          replies: 0,
          views: 0,
          isAnonymous,
          isModerated: moderationResult.flagged
        };
        
        setPosts(prev => [newPost, ...prev]);
        
        // Clear form
        setShowNewPostDialog(false);
        setNewPostTitle('');
        setNewPostContent('');
        setModerationWarning('');
        
        // Show success message
        alert(moderationResult.flagged ? 
          'Post submitted for review and will be published after moderation.' :
          'Post published successfully!');
      }
    } catch (error: any) {
      console.error('Error submitting post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit post. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!newReply.trim() || !selectedPost || !user) return;
    
    try {
      const { api } = await import('../../services/api');
      const response = await api.post('/forum/comments', {
        postId: selectedPost.id,
        content: newReply,
        isAnonymous,
        language: language || 'en'
      });
      
      if (response.data.success) {
        const newReplyObj: Reply = {
          id: response.data.data.id,
          postId: selectedPost.id,
          content: newReply,
          author: isAnonymous ? 'Anonymous' : user.email.split('@')[0],
          timestamp: 'just now',
          likes: 0,
          isAnonymous
        };
        
        setReplies(prev => [...prev, newReplyObj]);
        setNewReply('');
        
        // Update reply count in post
        setPosts(prev => prev.map(post => 
          post.id === selectedPost.id ? { ...post, replies: post.replies + 1 } : post
        ));
        setSelectedPost(prev => prev ? { ...prev, replies: prev.replies + 1 } : null);
      }
    } catch (error: any) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply. Please try again.');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    
    try {
      const { api } = await import('../../services/api');
      await api.post(`/forum/posts/${postId}/like`);
      
      // Update like count locally
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
      
      if (selectedPost?.id === postId) {
        setSelectedPost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (error: any) {
      console.error('Error liking post:', error);
    }
  };

  if (selectedPost) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedPost(null)}
          className="mb-6"
        >
          ← {t.backToForum}
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {selectedPost.isAnonymous ? '?' : selectedPost.author[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {selectedPost.isAnonymous ? 'Anonymous' : selectedPost.author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPost.timestamp}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedPost.isModerated && (
                  <Badge variant="outline" className="text-success border-success/20">
                    <Shield className="w-3 h-3 mr-1" />
                    {t.moderatedBadge}
                  </Badge>
                )}
                {selectedPost.isSensitive && (
                  <Badge variant="outline" className="text-warning border-warning/20">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {t.sensitiveBadge}
                  </Badge>
                )}
                <Button variant="ghost" size="sm">
                  <Flag className="w-4 h-4" />
                  <span className="sr-only">{t.report}</span>
                </Button>
              </div>
            </div>
            <CardTitle className="text-xl">{selectedPost.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {selectedPost.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{selectedPost.content}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                {selectedPost.likes} {t.likes}
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {selectedPost.replies} {t.replies}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {selectedPost.views} {t.views}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-4">Replies ({replies.length})</h3>
              <div className="space-y-4">
                {replies.map((reply) => (
                  <div key={reply.id} className="border-l-2 border-muted pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback>
                            {reply.isAnonymous ? '?' : reply.author[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {reply.isAnonymous ? 'Anonymous' : reply.author}
                        </span>
                        <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs"
                        onClick={() => console.log('Like reply:', reply.id)}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {reply.likes}
                      </Button>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                ))}
                
                {replies.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No replies yet. Be the first to respond!</p>
                  </div>
                )}
              </div>

              {user && (
                <div className="mt-6 pt-4 border-t">
                  <Textarea 
                    placeholder={`${t.reply}...`}
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="mb-3"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="reply-anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="reply-anonymous" className="text-sm">
                        {t.anonymous}
                      </label>
                    </div>
                    <Button 
                      onClick={handleSubmitReply}
                      disabled={!newReply.trim()}
                    >
                      {t.reply}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl mb-2">{t.title}</h1>
            <p className="text-muted-foreground text-lg">{t.subtitle}</p>
          </div>
          
          <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t.newPost}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t.newPost}</DialogTitle>
                <DialogDescription>
                  Share your thoughts and connect with peers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input 
                  placeholder={t.postTitle}
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <Textarea 
                  placeholder={t.postContent}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                />
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="anonymous" className="text-sm">
                    {t.anonymous}
                  </label>
                </div>
                
                {moderationWarning && (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-center gap-2 text-warning">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Content Review Required</span>
                    </div>
                    <p className="text-xs text-warning/80 mt-1">{moderationWarning}</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitPost} 
                    className="flex-1"
                    disabled={!newPostTitle.trim() || !newPostContent.trim() || submittingPost || !user}
                  >
                    {submittingPost ? 'Posting...' : t.submit}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowNewPostDialog(false);
                      setModerationWarning('');
                      setNewPostTitle('');
                      setNewPostContent('');
                    }}
                    disabled={submittingPost}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Safety Notice */}
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center gap-2 text-success mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Safe Community Space</span>
          </div>
          <p className="text-sm text-success/80 mb-2">{t.safetyNotice}</p>
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">{t.crisisWarning}</span>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              const label = language === 'hi' && category.labelHi ? category.labelHi
                         : language === 'ur' && category.labelUr ? category.labelUr
                         : category.label;
              
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  <CategoryIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory}>
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => setSelectedPost(post)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {post.isAnonymous ? '?' : post.author[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {post.isAnonymous ? 'Anonymous' : post.author}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {post.timestamp}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.isModerated && (
                          <Badge variant="outline" className="text-xs text-success border-success/20">
                            <Shield className="w-3 h-3 mr-1" />
                            {t.moderatedBadge}
                          </Badge>
                        )}
                        {post.isSensitive && (
                          <Badge variant="outline" className="text-xs text-warning border-warning/20">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {t.sensitiveBadge}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {post.replies} {t.replies}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views} {t.views}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikePost(post.id);
                        }}
                        disabled={!user}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {post.likes}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg mb-2">No posts found</h3>
            <p className="text-muted-foreground">Be the first to start a conversation in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}