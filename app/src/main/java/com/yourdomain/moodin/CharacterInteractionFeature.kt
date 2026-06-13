package com.yourdomain.moodin.ui.theme

import android.webkit.WebView
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.TextFieldValue // 🌟 추가됨: 한글 입력을 자연스럽게 만들어주는 핵심 도구
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView

// 1. 캐릭터 상태 정의
enum class CharacterState {
    IDLE,
    GREETING,
    INTERACTING,
    SAD,
    HAPPY,
    TOUCHED,
    ANGRY
}

@Composable
fun CharacterInteractionFeature(modifier: Modifier = Modifier) {
    var currentState by remember { mutableStateOf(CharacterState.IDLE) }
    var dialogueText by remember { mutableStateOf("캐릭터가 조용히 당신을 바라보고 있습니다.") }

    // 🌟 수정됨: 한글 자음/모음 조합이 실시간으로 보이도록 String 대신 TextFieldValue 사용
    var userInput by remember { mutableStateOf(TextFieldValue("")) }

    // 🌟 수정됨: 터미널 텍스트 -> Woolini 대화창으로 변경
    val logMessages = remember { mutableStateListOf("[울리니] Woolini 대화창이 초기화되었습니다.") }
    val listState = rememberLazyListState()

    LaunchedEffect(logMessages.size) {
        if (logMessages.isNotEmpty()) {
            listState.animateScrollToItem(logMessages.size - 1)
        }
    }

    fun addLog(sender: String, message: String) {
        logMessages.add("[$sender] $message")
    }

    // 🌟 수정됨: 입력값을 String으로 받도록 유지 (내부 로직을 위해)
    fun handleUserInput(inputText: String) {
        val text = inputText.trim()
        if (text.isEmpty()) return

        addLog("사용자", text)

        when {
            text.contains("기분 나빠") || text.contains("슬퍼") || text.contains("우울") -> {
                currentState = CharacterState.SAD
                dialogueText = "저런, 많이 속상하시겠어요. 제가 옆에서 이야기를 들어드릴게요. 무슨 일 있었나요?"
            }
            text.contains("좋아") || text.contains("행복") || text.contains("최고") -> {
                currentState = CharacterState.HAPPY
                dialogueText = "와! 기분 좋은 일이 있으셨군요! 저도 덩달아 신나요!"
            }
            text.contains("화나") || text.contains("짜증") -> {
                currentState = CharacterState.ANGRY
                dialogueText = "누가 우리 주인을 화나게 한 건가요! 제가 혼내줄게요!"
            }
            text.contains("안녕") || text.contains("반가워") -> {
                currentState = CharacterState.GREETING
                dialogueText = "안녕하세요! 오늘도 활기찬 하루 보내세요."
            }
            else -> {
                currentState = CharacterState.IDLE
                dialogueText = "잘 모르겠어, 지금 너의 기분을 말해줘 ^0^"
            }
        }

        // 🌟 수정됨: 모든 시스템 답변도 [울리니]로 통일
        addLog("울리니", dialogueText)

        // 🌟 수정됨: 전송 후 입력창 비우기 (TextFieldValue 전용 방식)
        userInput = TextFieldValue("")
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
    ) {
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            HtmlCharacterView(state = currentState, modifier = Modifier.fillMaxSize())

            Box(modifier = Modifier
                .fillMaxSize()
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) {
                    currentState = CharacterState.TOUCHED
                    dialogueText = "앗! 깜짝이야. 쓰다듬어 주시는 건가요?"
                    addLog("울리니", dialogueText)
                }
            )

            Surface(
                shape = RoundedCornerShape(
                    topStart = 24.dp,
                    topEnd = 24.dp,
                    bottomStart = 24.dp,
                    bottomEnd = 0.dp
                ),
                color = Color.White,
                shadowElevation = 8.dp,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(top = 16.dp, start = 16.dp, end = 64.dp)
            ) {
                Text(
                    text = dialogueText,
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color.DarkGray,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 14.dp)
                )
            }
        }

        Card(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .background(Color(0xFF1E1E1E), RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(logMessages) { log ->
                            val textColor = when {
                                log.startsWith("[사용자]") -> Color(0xFF81C784)
                                // 🌟 수정됨: 로그 색상 기준도 [울리니]로 변경
                                log.startsWith("[울리니]") -> Color(0xFF64B5F6)
                                else -> Color.LightGray
                            }
                            Text(
                                text = log,
                                color = textColor,
                                style = MaterialTheme.typography.bodySmall,
                                modifier = Modifier.padding(bottom = 4.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = userInput,
                        onValueChange = { userInput = it },
                        modifier = Modifier.weight(1f),
                        placeholder = { Text("대화를 입력해보세요...") },
                        singleLine = true,
                        shape = RoundedCornerShape(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        // 🌟 수정됨: TextFieldValue 안에서 실제 텍스트(String)만 꺼내서 전달
                        onClick = { handleUserInput(userInput.text) },
                        modifier = Modifier.height(56.dp),
                        shape = RoundedCornerShape(24.dp)
                    ) {
                        Text("전송")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // 🌟 수정됨: '기능 실행' 버튼 삭제, 남은 버튼들 간격 정리
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    Button(onClick = {
                        currentState = CharacterState.GREETING
                        dialogueText = "외부 장비에 인사 신호를 보냈습니다."
                        addLog("울리니", "GREETING 명령어 실행") // 시스템 -> 울리니 변경
                    }) {
                        Text("인사하기")
                    }

                    // 기능 실행 버튼 있던 자리 삭제됨

                    Button(
                        onClick = {
                            currentState = CharacterState.IDLE
                            dialogueText = "대기 모드로 돌아갑니다."
                            addLog("울리니", "IDLE 상태로 전환됨") // 시스템 -> 울리니 변경
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color.LightGray)
                    ) {
                        Text("대기", color = Color.Black)
                    }
                }
            }
        }
    }
}

@Composable
fun HtmlCharacterView(state: CharacterState, modifier: Modifier = Modifier) {
    AndroidView(
        factory = { context ->
            android.webkit.WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.loadWithOverviewMode = true
                settings.useWideViewPort = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = true

                setBackgroundColor(android.graphics.Color.TRANSPARENT)

                webViewClient = object : android.webkit.WebViewClient() {
                    override fun onPageFinished(view: android.webkit.WebView, url: String) {
                        super.onPageFinished(view, url)
                        val forceCenterScript = """
                            var meta = document.createElement('meta');
                            meta.name = 'viewport';
                            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                            document.getElementsByTagName('head')[0].appendChild(meta);

                            document.body.style.margin = '0';
                            document.body.style.padding = '0';
                            document.body.style.overflow = 'hidden';
                            document.body.style.backgroundColor = 'transparent';

                            var canvases = document.getElementsByTagName('canvas');
                            for(var i=0; i<canvases.length; i++) {
                                canvases[i].style.position = 'absolute';
                                canvases[i].style.left = '50%';
                                canvases[i].style.top = '50%';
                                canvases[i].style.transform = 'translate(-50%, -50%)';
                                canvases[i].style.maxWidth = '100vw';
                                canvases[i].style.maxHeight = '100vh';
                                canvases[i].style.objectFit = 'contain';
                            }
                        """.trimIndent()
                        view.evaluateJavascript(forceCenterScript, null)
                    }
                }

                val initialTarget = "file:///android_asset/" + getHtmlFileName(state)
                loadUrl(initialTarget)
            }
        },
        update = { webView ->
            val target = "file:///android_asset/" + getHtmlFileName(state)
            if (webView.url != target) {
                webView.loadUrl(target)
            }
        },
        modifier = modifier
    )
}

fun getHtmlFileName(state: CharacterState): String {
    return when (state) {
        CharacterState.IDLE,
        CharacterState.GREETING,
        CharacterState.HAPPY,
        CharacterState.TOUCHED -> "woolini.html"

        CharacterState.SAD -> "woolini_cry.html"

        CharacterState.INTERACTING,
        CharacterState.ANGRY -> "angry_woolini.html"
    }
}