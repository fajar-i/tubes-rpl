<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('kode_peserta');
            $table->foreignId('question_id')->constrained()->onDelete('cascade');
            $table->string('jawaban_huruf', 1)->nullable();
            $table->timestamps();
            $table->unique(['project_id', 'kode_peserta', 'question_id'], 'idx_unique_jawaban_per_project_peserta_question');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('answers', function (Blueprint $table) {
            $table->dropUnique('idx_unique_jawaban_per_project_peserta_question');
        });
    }
};
