const PostDetailScreen = ({ route, navigation }) => {
    const { post } = route.params;

    return (
        <View>
            <Text>{post.title}</Text>
            <Text>{post.content}</Text>

            {/* 수정 버튼 */}
            {post.authorId === 1 && (
                <Button
                    title="수정"
                    onPress={() => navigation.navigate('EditPost', { post })}
                />
            )}
        </View>
    );
};