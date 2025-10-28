-- Add performance indexes for better query performance

-- Index for course search queries
CREATE INDEX IF NOT EXISTS "idx_course_search" ON "Course" ("isPublished", "title", "description");

-- Index for course category queries
CREATE INDEX IF NOT EXISTS "idx_course_category" ON "Course" ("categoryid", "isPublished");

-- Index for course user queries
CREATE INDEX IF NOT EXISTS "idx_course_user" ON "Course" ("userId", "isPublished");

-- Index for chapter queries
CREATE INDEX IF NOT EXISTS "idx_chapter_course_order" ON "Chapter" ("courseId", "order", "isPublished");

-- Index for progress queries
CREATE INDEX IF NOT EXISTS "idx_progress_user_chapter" ON "progress" ("userId", "chapterId");

-- Index for access queries
CREATE INDEX IF NOT EXISTS "idx_access_course_user" ON "Access" ("courseId", "userId");

-- Index for user email queries
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User" ("email");

-- Index for category title queries
CREATE INDEX IF NOT EXISTS "idx_category_title" ON "Category" ("title");

-- Composite index for course search with category
CREATE INDEX IF NOT EXISTS "idx_course_search_category" ON "Course" ("isPublished", "categoryid", "title");

-- Index for certificate queries
CREATE INDEX IF NOT EXISTS "idx_certificate_course_user" ON "Certificate" ("courseId", "userId");

-- Index for session queries
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "Session" ("token");

-- Index for session expiration
CREATE INDEX IF NOT EXISTS "idx_session_expires" ON "Session" ("expiresAt");
