-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "comments" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "subtasks" JSONB NOT NULL DEFAULT '[]';
